import { Toast, ToastActionElement, ToastProps } from "@/components/ui/toast";
import { useState, useEffect, ReactNode } from "react";

const TOAST_LIMIT = 20;
const TOAST_REMOVE_DELAY = 1000000;

type ToasterToast = ToastProps & {
  id: string;
  title?: ReactNode;
  description?: ReactNode;
  action?: ToastActionElement;
};

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

let count = 0;

function generateId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}

type ActionType = typeof actionTypes;

type Action =
  | {
      type: ActionType["ADD_TOAST"];
      toast: ToasterToast;
    }
  | {
      type: ActionType["UPDATE_TOAST"];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ActionType["DISMISS_TOAST"];
      toastId?: string;
    }
  | {
      type: ActionType["REMOVE_TOAST"];
      toastId?: string;
    };

interface State {
  toasts: ToasterToast[];
}

function toastReducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case "DISMISS_TOAST": {
      const { toastId } = action;

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        setTimeout(() => {
          toast.remove(toastId);
        }, TOAST_REMOVE_DELAY);
      } else {
        state.toasts.forEach((t) => {
          setTimeout(() => {
            toast.remove(t.id);
          }, TOAST_REMOVE_DELAY);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      };
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

function useToasts() {
  const [state, setState] = useState<State>({ toasts: [] });

  const dispatch = (action: Action) => {
    setState((prevState) => toastReducer(prevState, action));
  };

  const toast = (props: Omit<ToasterToast, "id">) => {
    const id = generateId();
    const toastToAdd = { id, ...props, open: true };
    
    dispatch({
      type: "ADD_TOAST",
      toast: toastToAdd,
    });
    
    return id;
  };

  toast.update = (id: string, props: Partial<ToasterToast>) => {
    dispatch({
      type: "UPDATE_TOAST",
      toast: { id, ...props },
    });
  };

  toast.dismiss = (id?: string) => {
    dispatch({
      type: "DISMISS_TOAST",
      toastId: id,
    });
  };

  toast.remove = (id?: string) => {
    dispatch({
      type: "REMOVE_TOAST",
      toastId: id,
    });
  };

  return {
    toasts: state.toasts,
    toast,
  };
}

// A singleton to share state across the app
const singleton = { toasts: [], toast: null as any };

export function useToast() {
  const { toasts, toast } = useToasts();
  
  // Share state if initialized
  if (singleton.toast === null) {
    singleton.toasts = toasts;
    singleton.toast = toast;
  }
  
  return {
    toasts,
    toast: singleton.toast,
  };
}

// Expose the singleton to import directly
export const toast = (() => {
  // Initialize toast function if it's not there
  if (singleton.toast === null) {
    const { toast } = useToasts();
    singleton.toast = toast;
  }
  
  return singleton.toast;
})();


import { supabase } from "@/integrations/supabase/client";
import { Plan } from "../types";
import { toast } from "sonner";

export const fetchPlans = async (type?: 'music' | 'content'): Promise<Plan[]> => {
  try {
    let query = supabase
      .from('plans')
      .select('*');
    
    if (type) {
      query = query.eq('type', type);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching plans:", error);
      toast.error("Failed to load plans");
      return [];
    }
    
    return data.map(plan => ({
      ...plan,
      date: new Date(plan.date)
    })) as Plan[];
  } catch (error) {
    console.error("Exception fetching plans:", error);
    toast.error("An error occurred while loading plans");
    return [];
  }
};

export const createPlan = async (plan: Omit<Plan, 'id'>): Promise<Plan | null> => {
  try {
    // First try to get the current authenticated user from Supabase
    const { data: sessionData } = await supabase.auth.getSession();
    
    // If no authenticated session, try to get the user from localStorage as a fallback
    let userId = sessionData.session?.user?.id;
    
    if (!userId) {
      // Try to get from localStorage as fallback
      const storedUser = localStorage.getItem('j-studios-user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          userId = user.id;
        } catch (e) {
          console.error("Failed to parse stored user:", e);
        }
      }
    }
    
    if (!userId) {
      console.error("No user ID found from any source");
      toast.error("Authentication required to create plans");
      return null;
    }

    console.log("Creating plan with user ID:", userId);

    // Convert Date object to ISO string for Supabase
    const dateString = plan.date instanceof Date 
      ? plan.date.toISOString() 
      : String(plan.date);

    const { data, error } = await supabase
      .from('plans')
      .insert({
        title: plan.title,
        description: plan.description || '',
        date: dateString,
        platform: plan.platform,
        type: plan.type,
        status: plan.status || 'planned',
        user_id: userId
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error creating plan:", error);
      toast.error("Failed to create plan");
      return null;
    }
    
    toast.success("Plan created successfully");
    return {
      ...data,
      date: new Date(data.date)
    } as Plan;
  } catch (error) {
    console.error("Exception creating plan:", error);
    toast.error("An error occurred while creating the plan");
    return null;
  }
};

export const updatePlan = async (plan: Plan): Promise<Plan | null> => {
  try {
    // First try to get the current authenticated user from Supabase
    const { data: sessionData } = await supabase.auth.getSession();
    
    // If no authenticated session, try to get the user from localStorage as a fallback
    let userId = sessionData.session?.user?.id;
    
    if (!userId) {
      // Try to get from localStorage as fallback
      const storedUser = localStorage.getItem('j-studios-user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          userId = user.id;
        } catch (e) {
          console.error("Failed to parse stored user:", e);
        }
      }
    }
    
    if (!userId) {
      console.error("No user ID found from any source");
      toast.error("Authentication required to update plans");
      return null;
    }

    // Convert Date object to ISO string for Supabase
    const dateString = plan.date instanceof Date 
      ? plan.date.toISOString() 
      : String(plan.date);

    const { data, error } = await supabase
      .from('plans')
      .update({
        title: plan.title,
        description: plan.description || '',
        date: dateString,
        platform: plan.platform,
        status: plan.status,
        user_id: userId // Ensure user_id is set consistently
      })
      .eq('id', plan.id)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating plan:", error);
      toast.error("Failed to update plan");
      return null;
    }
    
    return {
      ...data,
      date: new Date(data.date)
    } as Plan;
  } catch (error) {
    console.error("Exception updating plan:", error);
    toast.error("An error occurred while updating the plan");
    return null;
  }
};

export const deletePlan = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('plans')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Error deleting plan:", error);
      toast.error("Failed to delete plan");
      return false;
    }
    
    toast.success("Plan deleted successfully");
    return true;
  } catch (error) {
    console.error("Exception deleting plan:", error);
    toast.error("An error occurred while deleting the plan");
    return false;
  }
};


import { useState, useEffect } from "react";
import { Plan } from "../types";
import { fetchPlans, createPlan, updatePlan, deletePlan } from "../services/plans-service";
import { useAuth } from "@/context/auth-context";

export const useMusicPlans = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadPlans = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      const loadedPlans = await fetchPlans('music');
      setPlans(loadedPlans);
      setIsLoading(false);
    };

    loadPlans();
  }, [user]);

  const addPlan = async (plan: Omit<Plan, 'id'>) => {
    const newPlan = await createPlan({
      ...plan,
      type: 'music'
    });
    
    if (newPlan) {
      setPlans(prev => [...prev, newPlan]);
    }
  };

  const handleUpdatePlan = async (updatedPlan: Plan) => {
    const result = await updatePlan(updatedPlan);
    
    if (result) {
      setPlans(prev => 
        prev.map(plan => plan.id === updatedPlan.id ? result : plan)
      );
    }
  };

  const handleDeletePlan = async (id: string) => {
    const success = await deletePlan(id);
    
    if (success) {
      setPlans(prev => prev.filter(plan => plan.id !== id));
    }
  };

  return {
    plans,
    isLoading,
    addPlan,
    updatePlan: handleUpdatePlan,
    deletePlan: handleDeletePlan,
  };
};

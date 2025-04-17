
import { useState, useEffect } from "react";
import { Plan } from "../types";

// Sample content plan data
const sampleContentPlans: Plan[] = [
  {
    id: "1",
    type: "content",
    title: "FL Studio Tutorial Series",
    description: "Part 1: Getting Started with FL Studio",
    date: new Date(new Date().setDate(new Date().getDate() + 2)),
    platform: "YouTube",
    status: "planned",
  },
  {
    id: "2",
    type: "content",
    title: "Behind the Scenes - Studio Session",
    description: "Short video of the production process",
    date: new Date(new Date().setDate(new Date().getDate() - 5)),
    platform: "Instagram",
    status: "completed",
  },
  {
    id: "3",
    type: "content",
    title: "Music Production Tips Blog Post",
    description: "5 Tips for Better Electronic Music Production",
    date: new Date(new Date().setDate(new Date().getDate() + 7)),
    platform: "Blog",
    status: "planned",
  },
];

export const useContentPlans = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data from an API
    const loadPlans = () => {
      setTimeout(() => {
        const storedPlans = localStorage.getItem("contentPlans");
        if (storedPlans) {
          setPlans(JSON.parse(storedPlans));
        } else {
          setPlans(sampleContentPlans);
          localStorage.setItem("contentPlans", JSON.stringify(sampleContentPlans));
        }
        setIsLoading(false);
      }, 500);
    };

    loadPlans();
  }, []);

  const addPlan = (plan: Plan) => {
    const newPlans = [...plans, plan];
    setPlans(newPlans);
    localStorage.setItem("contentPlans", JSON.stringify(newPlans));
  };

  const updatePlan = (updatedPlan: Plan) => {
    const newPlans = plans.map(plan => 
      plan.id === updatedPlan.id ? updatedPlan : plan
    );
    setPlans(newPlans);
    localStorage.setItem("contentPlans", JSON.stringify(newPlans));
  };

  const deletePlan = (id: string) => {
    const newPlans = plans.filter(plan => plan.id !== id);
    setPlans(newPlans);
    localStorage.setItem("contentPlans", JSON.stringify(newPlans));
  };

  return {
    plans,
    isLoading,
    addPlan,
    updatePlan,
    deletePlan,
  };
};

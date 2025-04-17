
import { useState, useEffect } from "react";
import { Plan } from "../types";

// Sample music plan data
const sampleMusicPlans: Plan[] = [
  {
    id: "1",
    type: "music",
    title: "Release New Single 'Midnight Dreams'",
    description: "Electronic/Dance track produced with FL Studio",
    date: new Date(new Date().setDate(new Date().getDate() + 5)),
    platform: "Spotify",
    status: "planned",
  },
  {
    id: "2",
    type: "music",
    title: "EP Pre-save Campaign",
    description: "Create pre-save links and promote on social media",
    date: new Date(new Date().setDate(new Date().getDate() - 2)),
    platform: "All Platforms",
    status: "completed",
  },
  {
    id: "3",
    type: "music",
    title: "Studio Session - Vocal Recording",
    description: "Record vocal tracks for upcoming EP",
    date: new Date(new Date().setDate(new Date().getDate() + 10)),
    status: "planned",
  },
];

export const useMusicPlans = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data from an API
    const loadPlans = () => {
      setTimeout(() => {
        const storedPlans = localStorage.getItem("musicPlans");
        if (storedPlans) {
          setPlans(JSON.parse(storedPlans));
        } else {
          setPlans(sampleMusicPlans);
          localStorage.setItem("musicPlans", JSON.stringify(sampleMusicPlans));
        }
        setIsLoading(false);
      }, 500);
    };

    loadPlans();
  }, []);

  const addPlan = (plan: Plan) => {
    const newPlans = [...plans, plan];
    setPlans(newPlans);
    localStorage.setItem("musicPlans", JSON.stringify(newPlans));
  };

  const updatePlan = (updatedPlan: Plan) => {
    const newPlans = plans.map(plan => 
      plan.id === updatedPlan.id ? updatedPlan : plan
    );
    setPlans(newPlans);
    localStorage.setItem("musicPlans", JSON.stringify(newPlans));
  };

  const deletePlan = (id: string) => {
    const newPlans = plans.filter(plan => plan.id !== id);
    setPlans(newPlans);
    localStorage.setItem("musicPlans", JSON.stringify(newPlans));
  };

  return {
    plans,
    isLoading,
    addPlan,
    updatePlan,
    deletePlan,
  };
};

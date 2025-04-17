
export type PlanType = "music" | "content";
export type PlanStatus = "planned" | "completed";

export interface Plan {
  id: string;
  type: PlanType;
  title: string;
  description?: string;
  date: Date | string;
  platform?: string;
  status: PlanStatus;
}

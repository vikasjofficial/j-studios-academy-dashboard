
export type PlanType = "music" | "content";
export type PlanStatus = "planned" | "completed";

export interface Plan {
  id: string;
  user_id?: string;
  type: PlanType;
  title: string;
  description?: string;
  date: Date | string;
  platform?: string;
  status: PlanStatus;
  created_at?: string;
  updated_at?: string;
}

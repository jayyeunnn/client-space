export type ProjectStatus = "active" | "completed" | "on_hold";

export type MilestoneStatus = "pending" | "in_progress" | "done" | "approved";

export interface Profile {
  id: string;
  full_name: string;
  business_name: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  freelancer_id: string;
  title: string;
  description: string | null;
  client_name: string;
  client_email: string | null;
  status: ProjectStatus;
  portal_token: string;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: MilestoneStatus;
  due_date: string | null;
  sort_order: number;
  created_at: string;
}

export interface ProjectFile {
  id: string;
  project_id: string;
  milestone_id: string | null;
  file_name: string;
  file_path: string;
  file_size: number | null;
  uploaded_at: string;
}

export interface InvoiceItem {
  description: string;
  qty: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  project_id: string;
  invoice_number: string;
  items: InvoiceItem[];
  subtotal: number;
  tax_rate: number;
  total: number;
  due_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PortalData {
  project: Project & { profiles: Pick<Profile, "full_name" | "business_name"> };
  milestones: Milestone[];
  files: ProjectFile[];
  invoice: Invoice | null;
}

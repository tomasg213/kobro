export type Client = {
  id: string;
  business_id: string;
  name: string;
  phone: string;
  email: string | null;
  debt_amount: number;
  notes: string | null;
  tags: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Transaction = {
  id: string;
  client_id: string;
  amount: number;
  due_date: string;
  reference_code: string | null;
  proof_image_url: string | null;
  ocr_result: Record<string, unknown> | null;
  status: TransactionStatus;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
};

export type TransactionStatus = 
  | 'pending' 
  | 'awaiting_approval' 
  | 'approved' 
  | 'rejected';

export type MessageTemplate = {
  id: string;
  business_id: string;
  name: string;
  content: string;
  template_type: TemplateType;
  is_active: boolean;
  created_at: string;
};

export type TemplateType = 'promotional' | 'reminder' | 'confirmation';

export type Campaign = {
  id: string;
  business_id: string;
  name: string;
  template_id: string;
  segment_tags: string[];
  status: CampaignStatus;
  scheduled_at: string | null;
  sent_count: number;
  created_at: string;
};

export type CampaignStatus = 'draft' | 'scheduled' | 'sent';

export type MessageLog = {
  id: string;
  client_id: string | null;
  transaction_id: string | null;
  template_id: string | null;
  direction: 'inbound' | 'outbound';
  content: string;
  whatsapp_message_id: string | null;
  status: MessageStatus;
  error_message: string | null;
  sent_at: string | null;
  created_at: string;
};

export type MessageStatus = 
  | 'queued' 
  | 'sent' 
  | 'delivered' 
  | 'read' 
  | 'failed';

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
};

export type PaymentReminder = {
  id: string;
  business_id: string;
  name: string;
  days_before_due: number;
  template_id: string;
  is_active: boolean;
  created_at: string;
};

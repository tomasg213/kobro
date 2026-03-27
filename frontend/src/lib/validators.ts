import { z } from 'zod';

export const clientSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(255),
  phone: z.string().min(8, 'Teléfono inválido').max(20),
  email: z.string().email('Email inválido').optional().nullable(),
  debt_amount: z.coerce.number().min(0).default(0),
  notes: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  is_active: z.boolean().default(true),
});

export type ClientFormData = z.infer<typeof clientSchema>;

export const transactionSchema = z.object({
  client_id: z.string().uuid('Cliente inválido'),
  amount: z.coerce.number().positive('El monto debe ser mayor a 0'),
  due_date: z.string().min(1, 'La fecha es requerida'),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;

export const templateSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(255),
  content: z.string().min(1, 'El contenido es requerido'),
  template_type: z.enum(['promotional', 'reminder', 'confirmation']),
  is_active: z.boolean().default(true),
});

export type TemplateFormData = z.infer<typeof templateSchema>;

export const campaignSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(255),
  template_id: z.string().uuid('Plantilla inválida'),
  segment_tags: z.array(z.string()).default([]),
  schedule_at: z.string().optional().nullable(),
});

export type CampaignFormData = z.infer<typeof campaignSchema>;

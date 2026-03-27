-- =============================================
-- Kobro WhatsApp Platform - Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PROFILES (extends Supabase Auth users)
-- =============================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- CLIENTS (CRM Básico)
-- =============================================
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email TEXT,
    debt_amount DECIMAL(12,2) DEFAULT 0 CHECK (debt_amount >= 0),
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(business_id, phone)
);

CREATE INDEX IF NOT EXISTS idx_clients_business ON public.clients(business_id);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON public.clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_active ON public.clients(is_active) WHERE is_active = true;

-- =============================================
-- TRANSACTIONS (Pagos)
-- =============================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    due_date DATE NOT NULL,
    reference_code TEXT,
    proof_image_url TEXT,
    ocr_result JSONB,
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending',
        'awaiting_approval',
        'approved',
        'rejected'
    )),
    approved_by UUID REFERENCES public.profiles(id),
    approved_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_client ON public.transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_due_date ON public.transactions(due_date);
CREATE INDEX IF NOT EXISTS idx_transactions_pending ON public.transactions(status, due_date) 
    WHERE status = 'pending';

-- =============================================
-- MESSAGE_TEMPLATES (Plantillas de mensajes)
-- =============================================
CREATE TABLE IF NOT EXISTS public.message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    template_type TEXT DEFAULT 'promotional' CHECK (template_type IN (
        'promotional',
        'reminder',
        'confirmation'
    )),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_templates_business ON public.message_templates(business_id);
CREATE INDEX IF NOT EXISTS idx_templates_type ON public.message_templates(template_type);

-- =============================================
-- CAMPAIGNS (Campañas de mensajería)
-- =============================================
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    template_id UUID NOT NULL REFERENCES public.message_templates(id) ON DELETE RESTRICT,
    segment_tags TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'draft' CHECK (status IN (
        'draft',
        'scheduled',
        'sending',
        'sent'
    )),
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    sent_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_business ON public.campaigns(business_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);

-- =============================================
-- MESSAGES_LOG (Registro de mensajes)
-- =============================================
CREATE TABLE IF NOT EXISTS public.messages_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    template_id UUID REFERENCES public.message_templates(id) ON DELETE SET NULL,
    direction TEXT NOT NULL CHECK (direction IN ('outbound', 'inbound')),
    content TEXT NOT NULL,
    whatsapp_message_id TEXT,
    status TEXT DEFAULT 'queued' CHECK (status IN (
        'queued',
        'sent',
        'delivered',
        'read',
        'failed'
    )),
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_client ON public.messages_log(client_id);
CREATE INDEX IF NOT EXISTS idx_messages_direction ON public.messages_log(direction);
CREATE INDEX IF NOT EXISTS idx_messages_status ON public.messages_log(status);
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.messages_log(created_at DESC);

-- =============================================
-- PAYMENT_REMINDERS (Configuración de recordatorios)
-- =============================================
CREATE TABLE IF NOT EXISTS public.payment_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    days_before_due INT DEFAULT 3 CHECK (days_before_due >= 0 AND days_before_due <= 30),
    template_id UUID NOT NULL REFERENCES public.message_templates(id) ON DELETE RESTRICT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reminders_business ON public.payment_reminders(business_id);
CREATE INDEX IF NOT EXISTS idx_reminders_active ON public.payment_reminders(is_active) WHERE is_active = true;

-- =============================================
-- Row Level Security (RLS) Policies
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_reminders ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read/update their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Clients: Users can only access their business data
CREATE POLICY "Users can view clients of their business"
    ON public.clients FOR SELECT
    USING (auth.uid() = business_id);

CREATE POLICY "Users can insert clients for their business"
    ON public.clients FOR INSERT
    WITH CHECK (auth.uid() = business_id);

CREATE POLICY "Users can update clients of their business"
    ON public.clients FOR UPDATE
    USING (auth.uid() = business_id);

CREATE POLICY "Users can delete clients of their business"
    ON public.clients FOR DELETE
    USING (auth.uid() = business_id);

-- Transactions: Users can access transactions of their clients
CREATE POLICY "Users can view transactions of their clients"
    ON public.transactions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.clients
            WHERE clients.id = transactions.client_id
            AND clients.business_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert transactions for their clients"
    ON public.transactions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.clients
            WHERE clients.id = transactions.client_id
            AND clients.business_id = auth.uid()
        )
    );

CREATE POLICY "Users can update transactions of their clients"
    ON public.transactions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.clients
            WHERE clients.id = transactions.client_id
            AND clients.business_id = auth.uid()
        )
    );

-- Message Templates
CREATE POLICY "Users can view templates of their business"
    ON public.message_templates FOR SELECT
    USING (auth.uid() = business_id);

CREATE POLICY "Users can insert templates for their business"
    ON public.message_templates FOR INSERT
    WITH CHECK (auth.uid() = business_id);

CREATE POLICY "Users can update templates of their business"
    ON public.message_templates FOR UPDATE
    USING (auth.uid() = business_id);

CREATE POLICY "Users can delete templates of their business"
    ON public.message_templates FOR DELETE
    USING (auth.uid() = business_id);

-- Campaigns
CREATE POLICY "Users can view campaigns of their business"
    ON public.campaigns FOR SELECT
    USING (auth.uid() = business_id);

CREATE POLICY "Users can insert campaigns for their business"
    ON public.campaigns FOR INSERT
    WITH CHECK (auth.uid() = business_id);

CREATE POLICY "Users can update campaigns of their business"
    ON public.campaigns FOR UPDATE
    USING (auth.uid() = business_id);

-- Messages Log
CREATE POLICY "Users can view messages of their clients"
    ON public.messages_log FOR SELECT
    USING (
        client_id IS NULL OR
        EXISTS (
            SELECT 1 FROM public.clients
            WHERE clients.id = messages_log.client_id
            AND clients.business_id = auth.uid()
        )
    );

CREATE POLICY "Service role can insert messages"
    ON public.messages_log FOR INSERT
    WITH CHECK (true);

-- Payment Reminders
CREATE POLICY "Users can view reminders of their business"
    ON public.payment_reminders FOR SELECT
    USING (auth.uid() = business_id);

CREATE POLICY "Users can manage reminders of their business"
    ON public.payment_reminders FOR ALL
    USING (auth.uid() = business_id);

-- =============================================
-- Helper Functions
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON public.clients
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_templates_updated_at
    BEFORE UPDATE ON public.message_templates
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
    BEFORE UPDATE ON public.campaigns
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reminders_updated_at
    BEFORE UPDATE ON public.payment_reminders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

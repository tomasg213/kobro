import { useState, useEffect } from 'react';
import { Campaign } from '@/types/database';

const mockCampaigns: Campaign[] = [
  {
    id: "c1",
    business_id: "b1",
    name: "Promoción Marzo 2024",
    template_id: "t1",
    segment_tags: ["VIP", "Cliente Frecuente"],
    status: "sent",
    scheduled_at: "2024-03-15T10:00:00Z",
    sent_count: 45,
    created_at: "2024-03-10T09:00:00Z",
  },
  {
    id: "c2",
    business_id: "b1",
    name: "Recordatorio de Pago",
    template_id: "t2",
    segment_tags: ["Moroso"],
    status: "sent",
    scheduled_at: "2024-03-20T09:00:00Z",
    sent_count: 12,
    created_at: "2024-03-18T14:00:00Z",
  },
  {
    id: "c3",
    business_id: "b1",
    name: "Nuevo Producto Disponible",
    template_id: "t1",
    segment_tags: [],
    status: "draft",
    scheduled_at: null,
    sent_count: 0,
    created_at: "2024-03-25T11:00:00Z",
  },
];

export type CampaignFormData = {
  name: string;
  template_id: string;
  segment_tags: string[];
  scheduled_at: string | null;
  business_id?: string;
};

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        setCampaigns(mockCampaigns);
        setError(null);
      } catch (err) {
        setError('Error al cargar campañas');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const addCampaign = async (campaignData: CampaignFormData) => {
    const newCampaign: Campaign = {
      id: crypto.randomUUID(),
      business_id: campaignData.business_id || "b1",
      name: campaignData.name,
      template_id: campaignData.template_id,
      segment_tags: campaignData.segment_tags,
      scheduled_at: campaignData.scheduled_at,
      status: 'draft',
      sent_count: 0,
      created_at: new Date().toISOString(),
    };
    setCampaigns(prev => [newCampaign, ...prev]);
    return newCampaign;
  };

  const sendCampaign = async (id: string) => {
    setCampaigns(prev => prev.map(c => 
      c.id === id 
        ? { ...c, status: 'sent', sent_at: new Date().toISOString() }
        : c
    ));
  };

  const deleteCampaign = async (id: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== id));
  };

  const stats = {
    total: campaigns.length,
    sent: campaigns.filter(c => c.status === 'sent').length,
    scheduled: campaigns.filter(c => c.status === 'scheduled').length,
    draft: campaigns.filter(c => c.status === 'draft').length,
    totalSent: campaigns.reduce((sum, c) => sum + c.sent_count, 0),
  };

  return {
    campaigns,
    loading,
    error,
    addCampaign,
    sendCampaign,
    deleteCampaign,
    stats,
  };
}

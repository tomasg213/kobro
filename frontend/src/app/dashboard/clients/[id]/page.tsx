"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Client, Transaction } from "@/types/database";
import { Header } from "@/components/dashboard/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { ArrowLeft, Phone, Mail, MapPin, Calendar, MessageSquare, Edit } from "lucide-react";

const mockClient: Client = {
  id: "1",
  business_id: "b1",
  name: "Juan Pérez",
  phone: "+5491112345678",
  email: "juan.perez@email.com",
  debt_amount: 15000,
  notes: "Cliente VIP, siempre paga a tiempo",
  tags: ["VIP", "Cliente Frecuente"],
  is_active: true,
  created_at: "2024-01-15T10:00:00Z",
  updated_at: "2024-03-20T14:30:00Z",
};

const mockTransactions: Transaction[] = [
  {
    id: "t1",
    client_id: "1",
    amount: 5000,
    due_date: "2024-04-15",
    reference_code: "REF-2024-001",
    proof_image_url: null,
    ocr_result: null,
    status: "pending",
    approved_by: null,
    approved_at: null,
    created_at: "2024-03-20T10:00:00Z",
    updated_at: "2024-03-20T10:00:00Z",
  },
  {
    id: "t4",
    client_id: "1",
    amount: 8000,
    due_date: "2024-02-28",
    reference_code: "REF-2024-004",
    proof_image_url: "https://example.com/proof2.jpg",
    ocr_result: { raw_code: "87654321" },
    status: "approved",
    approved_by: "admin1",
    approved_at: "2024-03-01T16:00:00Z",
    created_at: "2024-02-10T09:00:00Z",
    updated_at: "2024-03-01T16:00:00Z",
  },
];

const mockMessages = [
  { id: "m1", content: "Hola, ¿cómo estás?", direction: "outbound", status: "read", created_at: "2024-03-20T10:00:00Z" },
  { id: "m2", content: "¡Hola! Todo bien, gracias", direction: "inbound", status: "read", created_at: "2024-03-20T10:05:00Z" },
  { id: "m3", content: "Te envío el comprobante de pago", direction: "inbound", status: "read", created_at: "2024-03-22T14:30:00Z" },
];

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      setClient(mockClient);
      setTransactions(mockTransactions.filter(t => t.client_id === id));
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div>
        <Header title="Cargando..." subtitle="" />
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div>
        <Header title="Cliente no encontrado" subtitle="" />
        <div className="p-6 text-center">
          <p className="text-muted-foreground mb-4">El cliente que buscas no existe.</p>
          <Button asChild>
            <Link href="/dashboard/clients">Volver a clientes</Link>
          </Button>
        </div>
      </div>
    );
  }

  const pendingAmount = transactions
    .filter(t => t.status === "pending" || t.status === "awaiting_approval")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div>
      <Header 
        title={client.name} 
        subtitle={`Cliente desde ${formatDate(client.created_at)}`}
      />
      
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/clients">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Información
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xl font-semibold text-primary">
                    {client.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{client.name}</p>
                  <Badge className={getStatusColor(client.is_active ? "approved" : "rejected")}>
                    {client.is_active ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{client.phone}</span>
                </div>
                {client.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{client.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Creado {formatDate(client.created_at)}</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Etiquetas</p>
                <div className="flex flex-wrap gap-1">
                  {client.tags.map(tag => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>

              {client.notes && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-1">Notas</p>
                  <p className="text-sm">{client.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Estado de Cuenta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-accent">
                    <p className="text-sm text-muted-foreground">Deuda Total</p>
                    <p className={`text-2xl font-bold ${client.debt_amount > 0 ? "text-destructive" : "text-success"}`}>
                      {formatCurrency(client.debt_amount)}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-accent">
                    <p className="text-sm text-muted-foreground">Pendiente</p>
                    <p className={`text-2xl font-bold ${pendingAmount > 0 ? "text-warning" : "text-success"}`}>
                      {formatCurrency(pendingAmount)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transacciones Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay transacciones registradas
                  </p>
                ) : (
                  <div className="space-y-3">
                    {transactions.map(transaction => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                        <div>
                          <p className="font-medium">{formatCurrency(transaction.amount)}</p>
                          <p className="text-xs text-muted-foreground">
                            Vence: {formatDate(transaction.due_date)}
                            {transaction.reference_code && ` • Ref: ${transaction.reference_code}`}
                          </p>
                        </div>
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status === "pending" && "Pendiente"}
                          {transaction.status === "awaiting_approval" && "Por aprobar"}
                          {transaction.status === "approved" && "Aprobado"}
                          {transaction.status === "rejected" && "Rechazado"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Mensajes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockMessages.map(message => (
                    <div 
                      key={message.id} 
                      className={`flex ${message.direction === "outbound" ? "justify-end" : "justify-start"}`}
                    >
                      <div 
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.direction === "outbound" 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-accent"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.direction === "outbound" 
                            ? "text-primary-foreground/70" 
                            : "text-muted-foreground"
                        }`}>
                          {formatDate(message.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useTransactions } from "@/hooks/useTransactions";
import { useClients } from "@/hooks/useClients";
import { Header } from "@/components/dashboard/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Check, X, Image, MessageSquare, CheckCircle, Clock } from "lucide-react";

export default function PendingPage() {
  const { transactions, approveTransaction, loading } = useTransactions();
  const { clients, getClient } = useClients();
  
  const [approveDialog, setApproveDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const pendingTransactions = transactions.filter(t => t.status === "awaiting_approval");

  const getClientInfo = (clientId: string) => {
    const client = getClient(clientId);
    return client || null;
  };

  const handleApprove = (transactionId: string) => {
    setSelectedTransaction(transactionId);
    setApproveDialog(true);
  };

  const handleReject = (transactionId: string) => {
    setSelectedTransaction(transactionId);
    setRejectDialog(true);
  };

  const confirmApprove = async () => {
    if (selectedTransaction) {
      await approveTransaction(selectedTransaction, true);
    }
    setApproveDialog(false);
    setSelectedTransaction(null);
    setNotes("");
  };

  const confirmReject = async () => {
    if (selectedTransaction) {
      await approveTransaction(selectedTransaction, false);
    }
    setRejectDialog(false);
    setSelectedTransaction(null);
    setNotes("");
  };

  if (loading) {
    return (
      <div>
        <Header title="Transacciones Pendientes" subtitle="Revisar comprobantes" />
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header 
        title="Transacciones Pendientes" 
        subtitle={`${pendingTransactions.length} comprobantes por revisar`} 
      />
      
      <div className="p-6 space-y-6">
        {pendingTransactions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-success mb-4" />
              <h3 className="text-lg font-medium mb-2">Todo al día</h3>
              <p className="text-muted-foreground">
                No hay comprobantes pendientes de revisión
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingTransactions.map((transaction) => {
              const client = getClientInfo(transaction.client_id);
              
              return (
                <Card key={transaction.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {formatCurrency(transaction.amount)}
                      </CardTitle>
                      <Badge variant="warning" className="gap-1">
                        <Clock className="h-3 w-3" />
                        Por Aprobar
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Vence: {formatDate(transaction.due_date)}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {client && (
                      <div className="p-3 rounded-lg bg-accent">
                        <p className="font-medium">{client.name}</p>
                        <p className="text-sm text-muted-foreground">{client.phone}</p>
                      </div>
                    )}

                    {transaction.reference_code && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Referencia:</span>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {transaction.reference_code}
                        </code>
                      </div>
                    )}

                    {transaction.proof_image_url && (
                      <div className="p-3 rounded-lg bg-accent flex items-center gap-2">
                        <Image className="h-4 w-4" />
                        <span className="text-sm">Comprobante adjunto</span>
                      </div>
                    )}

                    {transaction.ocr_result && (
                      <div className="p-3 rounded-lg bg-accent">
                        <p className="text-xs text-muted-foreground mb-1">Código OCR:</p>
                        <code className="text-sm">
                          {(transaction.ocr_result as { raw_code?: string }).raw_code || "N/A"}
                        </code>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button 
                        className="flex-1 gap-1" 
                        onClick={() => handleApprove(transaction.id)}
                      >
                        <Check className="h-4 w-4" />
                        Aprobar
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 gap-1 text-destructive hover:text-destructive"
                        onClick={() => handleReject(transaction.id)}
                      >
                        <X className="h-4 w-4" />
                        Rechazar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={approveDialog} onOpenChange={setApproveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Aprobar Pago</DialogTitle>
              <DialogDescription>
                ¿Confirmás que el pago ha sido verificado y querés aprobarlo?
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                placeholder="Notas (opcional)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setApproveDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={confirmApprove} className="gap-1">
                <Check className="h-4 w-4" />
                Confirmar Aprobación
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rechazar Pago</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que querés rechazar este pago? Se notificará al cliente.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                placeholder="Motivo del rechazo (requerido)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialog(false)}>
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmReject}
                className="gap-1"
              >
                <X className="h-4 w-4" />
                Rechazar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

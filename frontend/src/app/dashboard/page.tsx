import { Header } from "@/components/dashboard/Header";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Receipt, Send, AlertCircle } from "lucide-react";

export default function DashboardPage() {
  return (
    <div>
      <Header 
        title="Dashboard" 
        subtitle="Resumen de tu actividad"
      />
      
      <div className="p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Clientes"
            value="248"
            subtitle="+12 este mes"
            icon={Users}
            trend={{ value: 5, positive: true }}
          />
          
          <StatsCard
            title="Pagos Pendientes"
            value="34"
            subtitle="$1,245,000 total"
            icon={Receipt}
            trend={{ value: 8, positive: false }}
          />
          
          <StatsCard
            title="Mensajes Enviados"
            value="1,234"
            subtitle="Este mes"
            icon={Send}
            trend={{ value: 15, positive: true }}
          />
          
          <StatsCard
            title="Por Aprobar"
            value="7"
            subtitle="Comprobantes pendientes"
            icon={AlertCircle}
          />
        </div>
        
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Últimas Transacciones</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Lista de transacciones recientes...
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Mensajes Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Registro de mensajes...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

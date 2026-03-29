import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    positive: boolean;
  };
  className?: string;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn("", className)} style={{ backgroundColor: '#0d261a', borderColor: 'rgba(255,255,255,0.1)' }}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white/60">{title}</p>
            <p className="text-2xl font-bold mt-1 text-white">{value}</p>
            {subtitle && (
              <p className="text-xs text-white/40 mt-1">{subtitle}</p>
            )}
            {trend && (
              <p className={cn(
                "text-xs mt-1",
                trend.positive ? "text-green-400" : "text-red-400"
              )}>
                {trend.positive ? "+" : ""}{trend.value}% vs mes anterior
              </p>
            )}
          </div>
          <div className="rounded-full bg-[#a8d5a8]/20 p-3">
            <Icon className="h-6 w-6 text-[#a8d5a8]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

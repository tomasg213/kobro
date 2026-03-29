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
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold mt-1 text-[#1a3a2a]">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
            )}
            {trend && (
              <p className={cn(
                "text-xs mt-1",
                trend.positive ? "text-green-600" : "text-red-600"
              )}>
                {trend.positive ? "+" : ""}{trend.value}% vs mes anterior
              </p>
            )}
          </div>
          <div className="rounded-full bg-[#4a7c59]/10 p-3">
            <Icon className="h-6 w-6 text-[#4a7c59]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

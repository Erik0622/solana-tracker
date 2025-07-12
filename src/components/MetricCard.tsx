import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: LucideIcon;
}

export const MetricCard = ({ title, value, change, trend, icon: Icon }: MetricCardProps) => {
  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/40 hover:border-border/60 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm font-medium">{title}</p>
            <div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className={`text-sm font-medium ${
                trend === "up" ? "text-profit" : "text-loss"
              }`}>
                {change}
              </p>
            </div>
          </div>
          <div className={`p-3 rounded-xl ${
            trend === "up" 
              ? "bg-profit/10 text-profit" 
              : "bg-loss/10 text-loss"
          }`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
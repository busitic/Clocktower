import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  sublabel?: string;
  icon: LucideIcon;
  highlight?: boolean;
}

export function StatCard({ label, value, sublabel, icon: Icon, highlight }: StatCardProps) {
  return (
    <Card className={cn(highlight && "border-primary/50 bg-primary/5")}>
      <CardContent className="flex items-start justify-between pt-6">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-3xl font-semibold tabular-nums">{value}</p>
          {sublabel && <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>}
        </div>
        <Icon className={cn("h-5 w-5", highlight ? "text-primary" : "text-muted-foreground")} />
      </CardContent>
    </Card>
  );
}
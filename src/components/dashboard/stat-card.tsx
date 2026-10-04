import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  sublabel?: string;
  icon: LucideIcon;
  highlight?: boolean;
  // When set, the whole card becomes a link to this route
  href?: string;
}

export function StatCard({ label, value, sublabel, icon: Icon, highlight, href }: StatCardProps) {
  const card = (
    <Card
      className={cn(
        "h-full transition-all",
        highlight && "border-primary/50 bg-primary/5",
        // group-hover works because the Link below carries the "group" class
        href && "group-hover:border-primary/50 group-hover:-translate-y-0.5 group-hover:shadow-md",
      )}
    >
      <CardContent className="flex items-start justify-between pt-6">
        <div>
          <p className="text-muted-foreground text-sm">{label}</p>
          <p className="text-3xl font-semibold tabular-nums">{value}</p>
          {sublabel && <p className="text-muted-foreground mt-1 text-xs">{sublabel}</p>}
        </div>

        <div className="flex flex-col items-end gap-3">
          {/* Icon in a small badge, tinted when the card is highlighted */}
          <span
            className={cn(
              "flex size-9 items-center justify-center rounded-lg",
              highlight ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
            )}
          >
            <Icon className="size-4" />
          </span>
          {/* Arrow appears only on clickable cards, as the cue that it goes somewhere */}
          {href && (
            <ArrowUpRight className="text-muted-foreground group-hover:text-primary size-4 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (!href) return card;

  return (
    <Link
      href={href}
      className="group focus-visible:ring-ring block rounded-xl outline-none focus-visible:ring-2"
    >
      {card}
    </Link>
  );
}
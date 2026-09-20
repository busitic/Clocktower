import type { LucideIcon } from "lucide-react";

export function EmptyState({
    icon: Icon,
    title,
    description,

}: {
    icon: LucideIcon;
    title: string;
    description: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
        <Icon className="text-muted-foreground size-10" />
        <p className="mt-4 font-medium">{title}</p>
        <p className="text-muted-foreground mt-1 max-w-sm text-sm">{description}</p>
        </div>
    );
}
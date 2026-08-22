import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface StatCardProps {
  label: string;
  value: string;
  tag: string;
  tone: "accent" | "success" | "warning" | "neutral";
  hint: string;
}

export function StatCard({ label, value, tag, tone, hint }: StatCardProps) {
  return (
    <Card className="p-4 sm:p-5 hover:border-border-strong transition-colors">
      <div className="flex items-center justify-between text-ink-muted text-[11px] sm:text-xs font-medium mb-2 sm:mb-3">
        <span>{label}</span>
        <Badge tone={tone}>{tag}</Badge>
      </div>
      <div className="text-xl sm:text-3xl font-extrabold text-ink tracking-tight">{value}</div>
      <p className="text-[11px] text-ink-faint mt-1 sm:mt-2">{hint}</p>
    </Card>
  );
}

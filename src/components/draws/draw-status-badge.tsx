import { cn } from "@/lib/utils";

const STATUS_MAP: Record<
  string,
  { label: string; className: string }
> = {
  draft: {
    label: "Rascunho",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  drawn: {
    label: "Sorteado",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  completed: {
    label: "Concluído",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
};

export function DrawStatusBadge({ status }: { status: string }) {
  const config = STATUS_MAP[status] ?? {
    label: status,
    className: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}

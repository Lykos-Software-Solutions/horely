const STYLES: Record<string, string> = {
  confirmed: "bg-pine-mist text-pine",
  completed: "bg-sand text-ink-soft",
  cancelled: "bg-clay-soft text-clay",
};

export const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmado",
  completed: "Completado",
  cancelled: "Cancelado",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STYLES[status] ?? STYLES.confirmed}`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

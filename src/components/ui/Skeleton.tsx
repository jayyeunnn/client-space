export function Skeleton({ width, height, className }: {
  width?: string | number;
  height?: string | number;
  className?: string;
}) {
  return (
    <div
      className={`animate-pulse ${className ?? ""}`}
      style={{
        width,
        height: height ?? 14,
        background: "var(--cs-s2)",
        borderRadius: 4,
      }}
    />
  );
}

export function ProjectCardSkeleton() {
  return (
    <div
      style={{
        background: "var(--cs-surface)",
        border: "1px solid var(--cs-bd)",
        borderRadius: 8,
        padding: "16px",
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <Skeleton width="55%" height={16} />
        <Skeleton width={52} height={20} />
      </div>
      <Skeleton width="70%" height={13} className="mb-4" />
      <div className="flex items-center justify-between">
        <Skeleton width={80} height={12} />
        <Skeleton width={60} height={12} />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div
      style={{
        background: "var(--cs-surface)",
        border: "1px solid var(--cs-bd)",
        borderRadius: 8,
        padding: "11px 14px",
      }}
    >
      <Skeleton width={60} height={11} className="mb-2" />
      <Skeleton width={40} height={22} />
    </div>
  );
}

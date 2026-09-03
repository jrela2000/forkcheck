export default function StarRating({ value = 0, count, size = "sm" }) {
  const sizes = { sm: "text-xs", md: "text-sm", lg: "text-base" };
  const stars = "★★★★★";
  const filled = Math.round(value);
  return (
    <div className={`inline-flex items-center gap-1 ${sizes[size]}`}>
      <span className="text-amber-500 tracking-tight">
        {stars.slice(0, filled)}
        <span className="text-amber-500/25">{stars.slice(filled)}</span>
      </span>
      <span className="font-semibold text-foreground">{value ? value.toFixed(1) : "New"}</span>
      {typeof count === "number" && (
        <span className="text-muted-foreground">({count})</span>
      )}
    </div>
  );
}
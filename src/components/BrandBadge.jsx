export default function BrandBadge({ verified = true, size = "sm" }) {
  const sizes = {
    sm: "text-[10px] px-1.5 py-0.5 gap-1",
    md: "text-xs px-2 py-1 gap-1.5",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full bg-amber-500/15 text-amber-600 font-semibold tracking-wide uppercase ${sizes[size]}`}
    >
      <span className="leading-none">✦</span>
      {verified ? "Black-Owned Verified" : "Black-Owned"}
    </span>
  );
}
import { emojiForRating } from "@/lib/format";

export default function EmojiSlider({ label, emoji, value, onChange }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-28 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">{emoji}</span>
          <span className="text-sm font-medium">{label}</span>
        </div>
      </div>
      <div className="relative flex-1">
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="fc-range w-full"
        />
        <div className="mt-1 flex justify-between px-0.5 text-[10px] text-muted-foreground">
          <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
        </div>
      </div>
      <div className="w-12 shrink-0 text-center">
        <span className="text-2xl">{emojiForRating(value)}</span>
        <div className="text-xs font-semibold text-amber-600">{value}/5</div>
      </div>
    </div>
  );
}
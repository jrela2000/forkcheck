export function formatPrice(range) {
  if (!range) return "";
  return "$".repeat(range);
}

export function formatRating(value) {
  if (!value || value === 0) return "New";
  return Number(value).toFixed(1);
}

export function categoryNames() {
  return [
    { key: "food_rating", label: "Food", emoji: "🍽️" },
    { key: "service_rating", label: "Service", emoji: "🛎️" },
    { key: "value_rating", label: "Value", emoji: "💰" },
    { key: "atmosphere_rating", label: "Atmosphere", emoji: "✨" },
    { key: "wait_time_rating", label: "Wait Time", emoji: "⏱️" },
  ];
}

export function overallFromRatings(ratings) {
  const vals = Object.values(ratings).filter((v) => typeof v === "number" && v > 0);
  if (vals.length === 0) return 0;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function emojiForRating(value) {
  if (value <= 1) return "🤢";
  if (value <= 2) return "😕";
  if (value <= 3) return "😐";
  if (value <= 4) return "😊";
  return "🤩";
}
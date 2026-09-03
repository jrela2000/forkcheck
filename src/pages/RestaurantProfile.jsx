import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import BrandBadge from "@/components/BrandBadge";
import StarRating from "@/components/StarRating";
import { formatPrice, categoryNames } from "@/lib/format";
import { ArrowLeft, MapPin, Globe, Phone, Utensils, Video, ThumbsUp, Quote } from "lucide-react";

export default function RestaurantProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await base44.entities.Restaurant.get(id);
        setRestaurant(r);
        const rv = await base44.entities.Review.filter({ restaurant_id: id, status: "published" }, "-created_date", 30);
        setReviews(rv);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading)
    return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-brand" /></div>;
  if (!restaurant) return <p className="p-8 text-center text-sm text-muted-foreground">Restaurant not found.</p>;

  const cats = categoryNames();
  const avg = cats.map((c) => ({ ...c, value: restaurant[c.key] || 0 })).filter((c) => c.value > 0);

  return (
    <div className="min-h-screen pb-28">
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        {restaurant.hero_image_url && (
          <Image src={restaurant.hero_image_url} alt={restaurant.name} className="h-full w-full" fittingType="fill" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 rounded-full bg-black/40 p-2 text-white backdrop-blur"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="mb-2 flex items-center gap-2">
            {restaurant.is_black_owned && <BrandBadge verified={restaurant.black_owned_verified} />}
          </div>
          <h1 className="font-heading text-2xl font-bold leading-tight">{restaurant.name}</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-white/90">
            <span className="text-amber-400">{formatPrice(restaurant.price_range)}</span>
            <span>·</span>
            <span>{restaurant.cuisine_type}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{restaurant.city}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 pt-5">
        <div className="rounded-2xl border border-border/60 bg-card p-4">
          <div className="flex items-center justify-between">
            <StarRating value={restaurant.rating_average} count={restaurant.review_count} size="md" />
            {restaurant.reservation_url && (
              <a
                href={restaurant.reservation_url}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-brand px-4 py-2 text-xs font-bold text-brand-foreground"
              >
                Reserve
              </a>
            )}
          </div>
          {avg.length > 0 && (
            <div className="mt-4 space-y-2">
              {avg.map((c) => (
                <div key={c.key} className="flex items-center gap-3">
                  <span className="w-24 text-xs text-muted-foreground">{c.emoji} {c.label}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-brand" style={{ width: `${(c.value / 5) * 100}%` }} />
                  </div>
                  <span className="w-8 text-right text-xs font-semibold">{c.value.toFixed(1)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {restaurant.description && (
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{restaurant.description}</p>
        )}

        <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {restaurant.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{restaurant.phone}</span>}
          {restaurant.website && (
            <a href={restaurant.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1"><Globe className="h-3.5 w-3.5" />Website</a>
          )}
        </div>

        <h2 className="mt-6 font-heading text-lg font-bold">Video reviews</h2>
        {reviews.length === 0 ? (
          <p className="mt-2 rounded-2xl bg-muted p-6 text-center text-sm text-muted-foreground">
            No video reviews yet. Be the first to share!
          </p>
        ) : (
          <div className="mt-3 space-y-4">
            {reviews.map((rv) => (
              <div key={rv.id} className="overflow-hidden rounded-2xl border border-border/60 bg-card">
                <div className="flex items-center gap-3 p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/15 text-brand">
                    <Video className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{rv.restaurant_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(rv.created_date).toLocaleDateString()}
                    </div>
                  </div>
                  <StarRating value={rv.overall_rating} />
                </div>
                {rv.ai_generated_summary && (
                  <div className="px-3 pb-3">
                    <p className="text-sm leading-relaxed">{rv.ai_generated_summary}</p>
                    {rv.highlight_quote && (
                      <p className="mt-2 flex items-start gap-2 text-xs italic text-muted-foreground">
                        <Quote className="mt-0.5 h-3 w-3 shrink-0 text-brand" />
                        {rv.highlight_quote}
                      </p>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-4 border-t border-border/40 px-3 py-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><ThumbsUp className="h-3 w-3" />{rv.helpful_votes || 0}</span>
                  {rv.video_url && (
                    <a href={rv.video_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand">
                      <Video className="h-3 w-3" />Watch
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-background/90 p-3 backdrop-blur-lg">
        <div className="mx-auto flex max-w-3xl">
          <button
            onClick={() => navigate(`/review/${restaurant.id}`)}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3.5 text-sm font-bold text-brand-foreground shadow-sm"
          >
            <Utensils className="h-4 w-4" />
            Record Your Review
          </button>
        </div>
      </div>
    </div>
  );
}
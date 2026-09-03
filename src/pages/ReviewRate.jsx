import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import EmojiSlider from "@/components/EmojiSlider";
import { categoryNames, overallFromRatings, emojiForRating } from "@/lib/format";
import { ArrowLeft, Check, Sparkles } from "lucide-react";

export default function ReviewRate() {
  const { reviewId } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [ratings, setRatings] = useState({
    food_rating: 4,
    service_rating: 4,
    value_rating: 4,
    atmosphere_rating: 4,
    wait_time_rating: 4,
  });
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    base44.entities.Review.get(reviewId).then(setReview).catch(() => {});
  }, [reviewId]);

  const overall = overallFromRatings(ratings);
  const cats = categoryNames();

  const publish = async () => {
    setPublishing(true);
    try {
      await base44.entities.Review.update(reviewId, {
        ...ratings,
        overall_rating: Number(overall.toFixed(2)),
        status: "published",
        platforms_published: { Google: true, Yelp: true, Foursquare: true },
      });
      navigate(`/restaurant/${review.restaurant_id}`);
    } catch (e) {
      alert("Publish failed: " + e.message);
      setPublishing(false);
    }
  };

  if (!review)
    return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-brand" /></div>;

  return (
    <div className="min-h-screen pb-28">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
        <button onClick={() => navigate(-1)} className="rounded-full bg-muted p-2">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold">Rate your experience</span>
      </div>

      <div className="mx-auto max-w-3xl px-4">
        <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3">
          {review.restaurant_image_url && (
            <Image src={review.restaurant_image_url} className="h-14 w-14 rounded-xl object-cover" fittingType="fill" />
          )}
          <div>
            <div className="text-sm font-bold">{review.restaurant_name}</div>
            <div className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3 text-brand" /> AI summary ready
            </div>
          </div>
        </div>

        {review.ai_generated_summary && (
          <div className="mt-3 rounded-2xl bg-brand/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">AI-written summary</p>
            <p className="mt-2 text-sm leading-relaxed">{review.ai_generated_summary}</p>
            {review.highlight_quote && (
              <p className="mt-2 text-xs italic text-muted-foreground">"{review.highlight_quote}"</p>
            )}
          </div>
        )}

        <h2 className="mt-6 font-heading text-lg font-bold">How was it?</h2>
        <p className="text-xs text-muted-foreground">Drag each slider — your overall score updates live.</p>

        <div className="mt-5 space-y-6">
          {cats.map((c) => (
            <EmojiSlider
              key={c.key}
              label={c.label}
              emoji={c.emoji}
              value={ratings[c.key]}
              onChange={(v) => setRatings((r) => ({ ...r, [c.key]: v }))}
            />
          ))}
        </div>

        <div className="mt-8 flex items-center justify-center gap-4 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 p-6 text-white">
          <span className="text-5xl">{emojiForRating(Math.round(overall))}</span>
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-white/80">Overall</div>
            <div className="font-heading text-3xl font-bold">{overall.toFixed(1)}</div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-background/90 p-3 backdrop-blur-lg">
        <div className="mx-auto max-w-3xl">
          <button
            onClick={publish}
            disabled={publishing}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3.5 text-sm font-bold text-brand-foreground"
          >
            {publishing ? (
              <><span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-foreground/40 border-t-brand-foreground" /> Publishing…</>
            ) : (
              <><Check className="h-4 w-4" /> Publish review</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
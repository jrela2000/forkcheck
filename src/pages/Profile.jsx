import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import TopBar from "@/components/TopBar";
import AppNav from "@/components/AppNav";
import StarRating from "@/components/StarRating";
import { Image } from "@/components/ui/image";
import { Video, ThumbsUp, Sparkles } from "lucide-react";

const BADGES = {
  regular: { label: "Reviewer", color: "bg-slate-200 text-slate-700" },
  food_critic: { label: "Food Critic", color: "bg-brand/20 text-brand" },
  hidden_gem_hunter: { label: "Hidden Gem Hunter", color: "bg-purple-200 text-purple-700" },
};

export default function Profile() {
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        const rv = await base44.entities.Review.filter({ status: "published" }, "-created_date", 50);
        setReviews(rv);
      } catch (e) {
        // not logged in
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const myReviews = reviews.filter((r) => r.created_by_id === user?.id);
  const totalHelpful = myReviews.reduce((a, b) => a + (b.helpful_votes || 0), 0);
  const platformsReached = myReviews.length * 3;

  const badge = BADGES.regular;
  const nextBadge = myReviews.length >= 5 ? "Food Critic" : null;

  if (loading)
    return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-brand" /></div>;

  if (!user)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 px-6 text-center">
        <p className="text-sm text-muted-foreground">Sign in to view your profile.</p>
      </div>
    );

  return (
    <div className="min-h-screen pb-20">
      <TopBar showSearch={false} />
      <div className="mx-auto max-w-3xl px-4 pt-5">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand text-2xl font-bold text-brand-foreground">
            {(user.full_name || user.email || "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold">{user.full_name || user.email}</h1>
            <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badge.color}`}>
              {badge.label}
            </span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            { label: "Reviews", value: myReviews.length },
            { label: "Helpful", value: totalHelpful },
            { label: "Reach", value: platformsReached },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border/60 bg-card p-3 text-center">
              <div className="font-heading text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {nextBadge && (
          <div className="mt-3 flex items-center gap-3 rounded-2xl bg-brand/10 p-3">
            <Sparkles className="h-5 w-5 text-brand" />
            <p className="text-xs text-muted-foreground">
              {myReviews.length} reviews · unlock <span className="font-semibold text-brand">{nextBadge}</span> at 5 reviews.
            </p>
          </div>
        )}

        <h2 className="mt-6 font-heading text-lg font-bold">Your reviews</h2>
        {myReviews.length === 0 ? (
          <p className="mt-2 rounded-2xl bg-muted p-6 text-center text-sm text-muted-foreground">
            No published reviews yet.
          </p>
        ) : (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {myReviews.map((rv) => (
              <div key={rv.id} className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                {rv.restaurant_image_url ? (
                  <Image src={rv.restaurant_image_url} className="h-full w-full" fittingType="fill" />
                ) : null}
                <div className="absolute bottom-1 left-1 flex items-center gap-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[9px] text-white">
                  <Video className="h-2.5 w-2.5" /> {rv.overall_rating?.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <AppNav />
    </div>
  );
}
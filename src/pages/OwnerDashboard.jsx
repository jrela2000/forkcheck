import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import TopBar from "@/components/TopBar";
import AppNav from "@/components/AppNav";
import StarRating from "@/components/StarRating";
import { Image } from "@/components/ui/image";
import { Quote, TrendingUp, ThumbsUp, Video } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function OwnerDashboard() {
  const [restaurants, setRestaurants] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const list = await base44.entities.Restaurant.list("-created_date", 50);
        setRestaurants(list);
        if (list[0]) setSelected(list[0].id);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selected) return;
    (async () => {
      const rv = await base44.entities.Review.filter({ restaurant_id: selected }, "-created_date", 100);
      setReviews(rv);
    })();
  }, [selected]);

  const stats = useMemo(() => {
    const published = reviews.filter((r) => r.status === "published");
    const avgSent = published.length
      ? published.reduce((a, b) => a + (b.sentiment_score || 0), 0) / published.length
      : 0;
    const helpful = published.reduce((a, b) => a + (b.helpful_votes || 0), 0);
    return { count: published.length, avgSent, helpful };
  }, [reviews]);

  const trend = useMemo(() => {
    return reviews
      .filter((r) => r.status === "published")
      .map((r) => ({
        date: new Date(r.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        sentiment: r.sentiment_score || 0,
        overall: r.overall_rating || 0,
      }))
      .reverse();
  }, [reviews]);

  const platformBreakdown = { Google: 0, Yelp: 0, Foursquare: 0 };
  reviews.forEach((r) => {
    const p = r.platforms_published || {};
    if (p.Google) platformBreakdown.Google++;
    if (p.Yelp) platformBreakdown.Yelp++;
    if (p.Foursquare) platformBreakdown.Foursquare++;
  });

  if (loading)
    return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-brand" /></div>;

  const restaurant = restaurants.find((r) => r.id === selected);

  return (
    <div className="min-h-screen pb-20">
      <TopBar showSearch={false} />
      <div className="mx-auto max-w-4xl px-4 pt-5">
        <h1 className="font-heading text-2xl font-bold">Owner Dashboard</h1>

        <div className="mt-4 flex flex-wrap gap-2">
          {restaurants.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelected(r.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                selected === r.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {r.name}
            </button>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <Stat label="Reviews" value={stats.count} />
          <Stat label="Avg Sentiment" value={stats.avgSent ? stats.avgSent.toFixed(1) : "—"} />
          <Stat label="Helpful Votes" value={stats.helpful} />
        </div>

        <div className="mt-4 rounded-2xl border border-border/60 bg-card p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-brand" />
            <h2 className="text-sm font-bold">Sentiment trend</h2>
          </div>
          {trend.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No published reviews yet.</p>
          ) : (
            <div className="mt-3 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", fontSize: 12 }} />
                  <Line type="monotone" dataKey="sentiment" stroke="hsl(var(--brand))" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="overall" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} strokeDasharray="4 4" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          {Object.entries(platformBreakdown).map(([p, n]) => (
            <div key={p} className="rounded-2xl border border-border/60 bg-card p-3 text-center">
              <div className="font-heading text-xl font-bold">{n}</div>
              <div className="text-xs text-muted-foreground">{p}</div>
            </div>
          ))}
        </div>

        <h2 className="mt-6 font-heading text-lg font-bold">Recent reviews</h2>
        {reviews.length === 0 ? (
          <p className="mt-2 rounded-2xl bg-muted p-6 text-center text-sm text-muted-foreground">No reviews yet.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {reviews.map((rv) => (
              <div key={rv.id} className="rounded-2xl border border-border/60 bg-card p-3">
                <div className="flex items-center justify-between">
                  <StarRating value={rv.overall_rating} />
                  <span className="text-xs text-muted-foreground">
                    {rv.status === "published" ? "Published" : "Processing"}
                  </span>
                </div>
                {rv.ai_generated_summary && (
                  <p className="mt-2 text-sm leading-relaxed">{rv.ai_generated_summary}</p>
                )}
                {rv.highlight_quote && (
                  <p className="mt-1 flex items-start gap-1 text-xs italic text-muted-foreground">
                    <Quote className="mt-0.5 h-3 w-3 shrink-0 text-brand" />{rv.highlight_quote}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><ThumbsUp className="h-3 w-3" />{rv.helpful_votes || 0}</span>
                  {rv.video_url && <a href={rv.video_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand"><Video className="h-3 w-3" />Watch</a>}
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

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 text-center">
      <div className="font-heading text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
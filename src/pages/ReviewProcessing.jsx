import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";

const STEPS = [
  "Uploading",
  "Transcribing",
  "Generating Summary",
  "Publishing",
];

const PLATFORMS = ["Google", "Yelp", "Foursquare"];

export default function ReviewProcessing() {
  const { reviewId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [platforms, setPlatforms] = useState({ Google: false, Yelp: false, Foursquare: false });
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      // Step 0: upload already complete; advance
      setStep(1);
      try {
        const res = await base44.functions.invoke("processReview", { reviewId });
        if (!active) return;
        if (res.data?.error) throw new Error(res.data.error);
        setStep(2);
        // simulate distribution
        for (const p of PLATFORMS) {
          await new Promise((r) => setTimeout(r, 700));
          if (!active) return;
          setPlatforms((s) => ({ ...s, [p]: true }));
        }
        setStep(3);
        await new Promise((r) => setTimeout(r, 600));
        if (active) navigate(`/review/${reviewId}/rate`);
      } catch (e) {
        if (active) setError(e.message);
      }
    })();
    return () => { active = false; };
  }, [reviewId]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <div className="relative flex h-24 w-24 items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-muted" />
        <div className="absolute inset-0 rounded-full border-4 border-brand border-t-transparent animate-fc-spin-slow" />
        <span className="text-2xl font-heading font-bold text-brand">Fc</span>
      </div>
      <h1 className="mt-8 font-heading text-xl font-bold">Processing your review</h1>
      <p className="mt-1 text-sm text-muted-foreground">This usually takes a few seconds.</p>

      <div className="mt-8 w-full max-w-xs space-y-3 text-left">
        {STEPS.map((s, i) => (
          <div key={s} className={`flex items-center gap-3 text-sm ${i <= step ? "text-foreground" : "text-muted-foreground/50"}`}>
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${i < step ? "bg-brand text-brand-foreground" : i === step ? "bg-brand/15 text-brand" : "bg-muted"}`}>
              {i < step ? "✓" : i + 1}
            </span>
            {s}
            {i === step && step < 3 && <span className="ml-auto h-1.5 w-1.5 animate-fc-pulse rounded-full bg-brand" />}
          </div>
        ))}
      </div>

      <div className="mt-8 w-full max-w-xs rounded-2xl border border-border/60 bg-card p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Platform delivery</p>
        <div className="mt-3 space-y-2">
          {PLATFORMS.map((p) => (
            <div key={p} className="flex items-center justify-between text-sm">
              <span>{p}</span>
              <span className={`text-xs font-semibold ${platforms[p] ? "text-brand" : "text-muted-foreground"}`}>
                {platforms[p] ? "Delivered ✓" : "Pending…"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <p className="mt-6 max-w-xs rounded-xl bg-destructive/10 p-3 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
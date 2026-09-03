import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { ArrowLeft, Video, Upload } from "lucide-react";

export default function ReviewRecord() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    base44.entities.Restaurant.get(restaurantId).then(setRestaurant).catch(() => {});
  }, [restaurantId]);

  const onSelect = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const submit = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const review = await base44.entities.Review.create({
        restaurant_id: restaurantId,
        restaurant_name: restaurant?.name || "",
        restaurant_image_url: restaurant?.hero_image_url || "",
        video_url: file_url,
        status: "processing",
      });
      navigate(`/review/${review.id}/processing`);
    } catch (e) {
      alert("Upload failed: " + e.message);
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <button onClick={() => navigate(-1)} className="rounded-full bg-white/10 p-2">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold">Record your review</span>
        <span className="w-9" />
      </div>

      <div className="mx-auto max-w-3xl px-4 pb-32">
        {restaurant && (
          <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
            {restaurant.hero_image_url && (
              <Image src={restaurant.hero_image_url} className="h-12 w-12 rounded-xl object-cover" fittingType="fill" />
            )}
            <div>
              <div className="text-sm font-semibold">{restaurant.name}</div>
              <div className="text-xs text-white/60">{restaurant.cuisine_type} · {restaurant.city}</div>
            </div>
          </div>
        )}

        {!previewUrl ? (
          <label className="mt-4 flex aspect-[9/12] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-white/20 bg-white/5 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/20 text-brand">
              <Video className="h-7 w-7" />
            </div>
            <p className="mt-4 text-sm font-semibold">Record your video review</p>
            <p className="mt-1 px-8 text-xs text-white/50">Tap to open your camera. Keep it under 90 seconds.</p>
            <input type="file" accept="video/*" capture="user" onChange={onSelect} className="hidden" />
          </label>
        ) : (
          <div className="mt-4 overflow-hidden rounded-3xl">
            <video src={previewUrl} controls className="aspect-[9/12] w-full bg-black object-cover" />
          </div>
        )}
      </div>

      {previewUrl && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black to-transparent p-4">
          <div className="mx-auto flex max-w-3xl gap-3">
            <button
              onClick={() => { setFile(null); setPreviewUrl(null); }}
              disabled={uploading}
              className="flex-1 rounded-full bg-white/10 py-3.5 text-sm font-semibold"
            >
              Retake
            </button>
            <button
              onClick={submit}
              disabled={uploading}
              className="flex flex-[2] items-center justify-center gap-2 rounded-full bg-brand py-3.5 text-sm font-bold text-brand-foreground"
            >
              {uploading ? (
                <><span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-foreground/40 border-t-brand-foreground" /> Uploading…</>
              ) : (
                <><Upload className="h-4 w-4" /> Continue</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
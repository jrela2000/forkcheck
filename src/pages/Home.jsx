import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import TopBar from "@/components/TopBar";
import RestaurantCard from "@/components/RestaurantCard";
import AppNav from "@/components/AppNav";
import { Image } from "@/components/ui/image";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "black", label: "Black-Owned" },
  { key: "top", label: "Top Rated" },
  { key: "near", label: "Near Me" },
];

function distance(lat1, lon1, lat2, lon2) {
  const R = 3959;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const list = await base44.entities.Restaurant.list("-rating_average", 40);
        setRestaurants(list);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  const visible = (() => {
    let list = [...restaurants];
    if (filter === "black") list = list.filter((r) => r.is_black_owned);
    if (filter === "top") list = list.sort((a, b) => (b.rating_average || 0) - (a.rating_average || 0));
    if (filter === "near" && coords) {
      list = list
        .filter((r) => r.latitude && r.longitude)
        .map((r) => ({ ...r, _d: distance(coords.lat, coords.lon, r.latitude, r.longitude) }))
        .sort((a, b) => a._d - b._d);
    }
    return list;
  })();

  return (
    <div className="min-h-screen pb-20">
      <TopBar />
      <section className="mx-auto max-w-3xl px-4 pt-5">
        <div className="rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 p-6 text-white shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/80">Find it. Experience it. Share it.</p>
          <h1 className="mt-1 font-heading text-2xl font-bold leading-tight">
            Discover restaurants through real video reviews.
          </h1>
        </div>
      </section>

      <div className="sticky top-[57px] z-20 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-3xl gap-2 overflow-x-auto px-4 py-3 no-scrollbar">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                filter === f.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-secondary"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-4 pb-8">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">No restaurants found.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {visible.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        )}
      </main>
      <AppNav />
    </div>
  );
}
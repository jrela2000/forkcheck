import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import TopBar from "@/components/TopBar";
import RestaurantCard from "@/components/RestaurantCard";
import AppNav from "@/components/AppNav";
import { SlidersHorizontal, X } from "lucide-react";

const CUISINES = ["Caribbean", "Soul Food", "BBQ", "Italian", "Mexican", "Japanese", "American", "Vegan"];

export default function Search() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState({
    cuisine: [],
    price: 0,
    minRating: 0,
    blackOwned: false,
    sortBy: "relevance",
  });

  useEffect(() => {
    (async () => {
      try {
        const list = await base44.entities.Restaurant.list("-rating_average", 60);
        setRestaurants(list);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const results = useMemo(() => {
    let list = [...restaurants];
    if (q.trim()) {
      const term = q.toLowerCase();
      list = list.filter(
        (r) =>
          r.name?.toLowerCase().includes(term) ||
          r.cuisine_type?.toLowerCase().includes(term) ||
          r.city?.toLowerCase().includes(term) ||
          r.description?.toLowerCase().includes(term)
      );
    }
    if (filters.cuisine.length)
      list = list.filter((r) => filters.cuisine.includes(r.cuisine_type));
    if (filters.price) list = list.filter((r) => r.price_range === filters.price);
    if (filters.minRating) list = list.filter((r) => (r.rating_average || 0) >= filters.minRating);
    if (filters.blackOwned) list = list.filter((r) => r.is_black_owned);
    if (filters.sortBy === "rating") list.sort((a, b) => (b.rating_average || 0) - (a.rating_average || 0));
    if (filters.sortBy === "reviewed") list.sort((a, b) => (b.review_count || 0) - (a.review_count || 0));
    return list;
  }, [restaurants, q, filters]);

  const toggleCuisine = (c) =>
    setFilters((f) => ({
      ...f,
      cuisine: f.cuisine.includes(c) ? f.cuisine.filter((x) => x !== c) : [...f.cuisine, c],
    }));

  return (
    <div className="min-h-screen pb-20">
      <TopBar title="Search" showSearch={false} />
      <div className="mx-auto max-w-3xl px-4 pt-3">
        <div className="flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search 'jerk chicken Chicago'…"
            className="flex-1 rounded-full border border-border bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand"
          />
          <button
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          {loading ? "Loading…" : `${results.length} restaurants`}
        </p>

        <div className="mt-3 grid grid-cols-2 gap-3">
          {results.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </div>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setDrawerOpen(false)}>
          <div
            className="w-full max-w-md rounded-t-3xl bg-card p-5 pb-8 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold">Filters</h2>
              <button onClick={() => setDrawerOpen(false)} className="text-muted-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cuisine</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {CUISINES.map((c) => (
                  <button
                    key={c}
                    onClick={() => toggleCuisine(c)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                      filters.cuisine.includes(c)
                        ? "bg-brand text-brand-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Price</p>
              <div className="mt-2 flex gap-2">
                {[0, 1, 2, 3, 4].map((p) => (
                  <button
                    key={p}
                    onClick={() => setFilters((f) => ({ ...f, price: p }))}
                    className={`flex-1 rounded-xl border py-2 text-sm font-semibold ${
                      filters.price === p ? "border-brand bg-brand/10 text-brand" : "border-border text-muted-foreground"
                    }`}
                  >
                    {p === 0 ? "Any" : "$".repeat(p)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Min Rating: {filters.minRating.toFixed(1)}
              </p>
              <input
                type="range"
                min={0}
                max={5}
                step={0.5}
                value={filters.minRating}
                onChange={(e) => setFilters((f) => ({ ...f, minRating: Number(e.target.value) }))}
                className="fc-range mt-2 w-full"
                style={{ "--fc-fill": `${(filters.minRating / 5) * 100}%` }}
              />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm font-medium">Black-Owned only</span>
              <button
                onClick={() => setFilters((f) => ({ ...f, blackOwned: !f.blackOwned }))}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  filters.blackOwned ? "bg-brand" : "bg-muted"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                    filters.blackOwned ? "left-5" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sort by</p>
              <div className="mt-2 flex gap-2">
                {[
                  { k: "relevance", l: "Relevance" },
                  { k: "rating", l: "Rating" },
                  { k: "reviewed", l: "Most Reviewed" },
                ].map((s) => (
                  <button
                    key={s.k}
                    onClick={() => setFilters((f) => ({ ...f, sortBy: s.k }))}
                    className={`flex-1 rounded-xl py-2 text-xs font-semibold ${
                      filters.sortBy === s.k ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {s.l}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setDrawerOpen(false)}
              className="mt-6 w-full rounded-full bg-brand py-3 text-sm font-bold text-brand-foreground"
            >
              Show {results.length} results
            </button>
          </div>
        </div>
      )}
      <AppNav />
    </div>
  );
}
import { Link } from "react-router-dom";
import { MapPin, Video } from "lucide-react";
import BrandBadge from "@/components/BrandBadge";
import StarRating from "@/components/StarRating";
import { formatPrice } from "@/lib/format";
import { Image } from "@/components/ui/image";

export default function RestaurantCard({ restaurant, latestReview }) {
  return (
    <Link
      to={`/restaurant/${restaurant.id}`}
      className="group block overflow-hidden rounded-2xl bg-card border border-border/60 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {restaurant.hero_image_url ? (
          <Image
            src={restaurant.hero_image_url}
            alt={restaurant.name}
            className="h-full w-full transition-transform duration-500 group-hover:scale-105"
            fittingType="fill"
          />
        ) : (
          <div className="h-full w-full bg-muted" />
        )}
        {restaurant.is_black_owned && (
          <div className="absolute top-3 left-3">
            <BrandBadge verified={restaurant.black_owned_verified} />
          </div>
        )}
        {latestReview?.video_thumbnail_url && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/70 backdrop-blur px-2 py-1 text-white text-[10px] font-medium">
            <Video className="h-3 w-3" />
            Video
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading font-semibold leading-tight line-clamp-1">{restaurant.name}</h3>
          <span className="text-xs font-medium text-amber-600">{formatPrice(restaurant.price_range)}</span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
          {restaurant.cuisine_type}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <StarRating value={restaurant.rating_average} count={restaurant.review_count} />
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {restaurant.city}
          </span>
        </div>
      </div>
    </Link>
  );
}
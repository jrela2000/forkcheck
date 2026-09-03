import { Link } from "react-router-dom";
import { Search } from "lucide-react";

export default function TopBar({ title = "ForkCheck", showSearch = true }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-lg font-heading font-bold tracking-tight">
            Fork<span className="text-amber-500">Check</span>
          </span>
        </Link>
        {showSearch && (
          <Link
            to="/search"
            className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground"
          >
            <Search className="h-3.5 w-3.5" />
            Search restaurants
          </Link>
        )}
      </div>
    </header>
  );
}
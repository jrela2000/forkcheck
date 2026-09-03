import { Link, useLocation } from "react-router-dom";
import { Home, Search, User, UtensilsCrossed } from "lucide-react";

const links = [
  { to: "/", label: "Feed", icon: Home },
  { to: "/search", label: "Search", icon: Search },
  { to: "/owner", label: "Owner", icon: UtensilsCrossed },
  { to: "/profile", label: "Profile", icon: User },
];

export default function AppNav() {
  const { pathname } = useLocation();
  return (
    <nav className="sticky bottom-0 z-40 border-t border-border/60 bg-background/80 backdrop-blur-lg md:hidden">
      <div className="grid grid-cols-4">
        {links.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
                active ? "text-amber-600" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
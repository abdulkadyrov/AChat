import { NavLink } from "react-router-dom";
import { bottomNavItems } from "@/shared/config/navigation";
import { cn } from "@/shared/lib/utils/cn";

export function BottomNavigation() {
  return (
    <nav className="sticky bottom-0 mt-auto border-t border-slate-200/70 bg-white/85 px-3 py-2 backdrop-blur-xl dark:border-white/10 dark:bg-[#0f1724]/85">
      <div className="mx-auto flex max-w-xl items-center justify-around gap-2">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex min-w-20 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-semibold transition",
                  isActive
                    ? "bg-accent-soft text-accent dark:bg-accent/15 dark:text-accent-dark"
                    : "text-ink-soft hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5"
                )
              }
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

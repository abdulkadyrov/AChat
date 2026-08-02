import { NavLink } from "react-router-dom";
import { bottomNavItems } from "@/shared/config/navigation";

export function BottomNavigation() {
  return (
    <nav className="bottom-navigation" aria-label="Основная навигация">
      {bottomNavItems.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.href}
            to={item.href}
            aria-label={item.label}
            className={({ isActive }) =>
              `bottom-navigation__item${isActive ? " bottom-navigation__item--active" : ""}`
            }
          >
            <Icon aria-hidden="true" size={21} strokeWidth={1.8} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

export type NavIcon =
  | "home"
  | "calendar"
  | "clock"
  | "users"
  | "wrench"
  | "clipboard";

export interface NavItem {
  label: string;
  path: string;
  icon: NavIcon;
  /** Not yet implemented — shown greyed out. */
  disabled?: boolean;
}

/** Primary sidebar navigation for the Workshop portal. */
export const NAV_ITEMS: NavItem[] = [
  { label: "Übersicht", path: "/", icon: "home" },
  { label: "Termine", path: "/appointments", icon: "calendar" },
  { label: "Reparaturen", path: "/repair-orders", icon: "clipboard" },
  { label: "Verfügbarkeit", path: "/availability", icon: "clock" },
  { label: "Team", path: "/team", icon: "users" },
  { label: "Werkstatt", path: "/workshop", icon: "wrench" },
];

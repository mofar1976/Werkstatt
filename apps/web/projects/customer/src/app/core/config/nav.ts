export type NavIcon = "home" | "search" | "calendar" | "clipboard";

export interface NavItem {
  label: string;
  path: string;
  icon: NavIcon;
  /** Not yet implemented — shown greyed out. */
  disabled?: boolean;
}

/** Primary sidebar navigation for the Customer portal. */
export const NAV_ITEMS: NavItem[] = [
  { label: "Übersicht", path: "/", icon: "home" },
  { label: "Werkstatt finden", path: "/workshops", icon: "search" },
  { label: "Meine Termine", path: "/appointments", icon: "calendar" },
  { label: "Reparaturen", path: "/repairs", icon: "clipboard" },
];

export type NavIcon =
  | "home"
  | "wrench"
  | "tag"
  | "users"
  | "calendar"
  | "clipboard";

export interface NavItem {
  label: string;
  path: string;
  icon: NavIcon;
  /** Not yet implemented — shown greyed out. */
  disabled?: boolean;
}

/** Primary sidebar navigation for the Backoffice. */
export const NAV_ITEMS: NavItem[] = [
  { label: "Übersicht", path: "/", icon: "home" },
  { label: "Werkstätten", path: "/workshops", icon: "wrench" },
  { label: "Termine", path: "/appointments", icon: "calendar" },
  { label: "Reparaturen", path: "/repairs", icon: "clipboard" },
  { label: "Marken & Modelle", path: "/car-catalog", icon: "tag" },
  { label: "Nutzer", path: "/customers", icon: "users" },
];

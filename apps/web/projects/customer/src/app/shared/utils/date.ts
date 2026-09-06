const dateTimeFmt = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const dateFmt = new Intl.DateTimeFormat("de-DE", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const timeFmt = new Intl.DateTimeFormat("de-DE", {
  hour: "2-digit",
  minute: "2-digit",
});

/** e.g. `03.09.2026 · 14:30` */
export function formatDateTime(iso: string): string {
  return dateTimeFmt.format(new Date(iso)).replace(",", " ·");
}

/** e.g. `Donnerstag, 03. September 2026` */
export function formatDate(iso: string): string {
  return dateFmt.format(new Date(iso));
}

/** e.g. `14:30` */
export function formatTime(iso: string): string {
  return timeFmt.format(new Date(iso));
}

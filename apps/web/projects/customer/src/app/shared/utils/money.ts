const eur = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
});

/** Format an integer cent amount as a German EUR string, e.g. `1234` → `12,34 €`. */
export function formatEur(cents: number): string {
  return eur.format(cents / 100);
}

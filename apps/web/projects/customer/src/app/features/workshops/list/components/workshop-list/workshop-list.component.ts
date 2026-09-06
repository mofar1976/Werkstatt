import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { RouterLink } from "@angular/router";
import type { PublicWorkshop } from "@car-garage/shared";

@Component({
  selector: "cu-workshop-list",
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./workshop-list.component.html",
  styleUrl: "./workshop-list.component.css",
})
export class WorkshopListComponent {
  readonly workshops = input.required<PublicWorkshop[]>();
  readonly focusedId = input<string | null>(null);

  /** A card was selected — the map should focus this workshop. */
  readonly select = output<string>();

  cardClass(id: string): string {
    const base =
      "w-full rounded-xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-brand-100";
    return id === this.focusedId()
      ? `${base} border-brand-400 bg-brand-50/60`
      : `${base} border-slate-200 bg-white hover:border-brand-300`;
  }

  address(w: PublicWorkshop): string {
    return `${w.address.street}, ${w.address.postalCode} ${w.address.city}`;
  }
}

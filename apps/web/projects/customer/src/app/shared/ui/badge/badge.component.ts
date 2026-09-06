import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";

export type BadgeTone = "gray" | "green" | "amber" | "red" | "blue";

/**
 *   <bo-badge tone="green">Aktiv</bo-badge>
 */
@Component({
  selector: "bo-badge",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./badge.component.html",
  styleUrl: "./badge.component.css",
})
export class BadgeComponent {
  readonly tone = input<BadgeTone>("gray");

  protected readonly classes = computed(() => {
    const map: Record<BadgeTone, string> = {
      gray: "bg-slate-100 text-slate-600",
      green: "bg-green-100 text-green-700",
      amber: "bg-amber-100 text-amber-700",
      red: "bg-red-100 text-red-700",
      blue: "bg-brand-50 text-brand-700",
    };
    return `inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${map[this.tone()]}`;
  });
}

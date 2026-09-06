import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";

export type AlertVariant = "error" | "success" | "warning" | "info";

/**
 *   <bo-alert variant="error">{{ message }}</bo-alert>
 */
@Component({
  selector: "bo-alert",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./alert.component.html",
  styleUrl: "./alert.component.css",
})
export class AlertComponent {
  readonly variant = input<AlertVariant>("info");

  protected readonly boxClass = computed(() => {
    const map: Record<AlertVariant, string> = {
      error: "border-red-200 bg-red-50 text-red-700",
      success: "border-green-200 bg-green-50 text-green-700",
      warning: "border-amber-200 bg-amber-50 text-amber-700",
      info: "border-slate-200 bg-slate-50 text-slate-600",
    };
    return `flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm ${map[this.variant()]}`;
  });
}

import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import { SpinnerComponent } from "../spinner/spinner.component";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";

/**
 * Shared action button.
 *
 *   <bo-button type="submit" [loading]="saving()" block>Speichern</bo-button>
 *   <bo-button variant="secondary" (click)="cancel()">Abbrechen</bo-button>
 */
@Component({
  selector: "bo-button",
  standalone: true,
  imports: [SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./button.component.html",
  styleUrl: "./button.component.css",
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>("primary");
  readonly type = input<"button" | "submit">("button");
  readonly size = input<ButtonSize>("md");
  readonly loading = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly block = input(false, { transform: booleanAttribute });

  protected readonly isDisabled = computed(
    () => this.disabled() || this.loading(),
  );

  protected readonly classes = computed(() => {
    const base =
      "inline-flex items-center justify-center gap-2 rounded-lg font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
    const size =
      this.size() === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3 py-2.5 text-sm";
    const width = this.block() ? "w-full" : "";
    const variant: Record<ButtonVariant, string> = {
      primary:
        "bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500",
      secondary:
        "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-brand-500",
      ghost:
        "text-slate-700 shadow-none hover:bg-slate-100 focus:ring-brand-500",
      danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    };
    return `${base} ${size} ${width} ${variant[this.variant()]}`;
  });
}

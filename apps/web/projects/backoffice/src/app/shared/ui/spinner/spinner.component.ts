import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";

export type SpinnerSize = "sm" | "md";

/**
 * Animated loading indicator. Colour is inherited (`currentColor`), so the
 * caller controls it via a `text-*` class on an ancestor.
 *
 *   <bo-spinner />                     <!-- icon only, e.g. inside a button -->
 *   <bo-spinner label="Lädt …" />      <!-- icon + text -->
 */
@Component({
  selector: "bo-spinner",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./spinner.component.html",
  styleUrl: "./spinner.component.css",
})
export class SpinnerComponent {
  readonly label = input<string>();
  readonly size = input<SpinnerSize>("sm");

  protected readonly iconClass = computed(() =>
    this.size() === "md" ? "h-5 w-5 animate-spin" : "h-4 w-4 animate-spin",
  );
}

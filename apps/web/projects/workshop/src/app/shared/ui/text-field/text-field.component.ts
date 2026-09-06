import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";

let uid = 0;

export type TextFieldIcon = "mail" | "lock" | "search" | "none";
export type TextFieldType = "text" | "email" | "password" | "tel" | "url";

/**
 * Labelled text input wired to a reactive `FormControl`, with an optional
 * leading icon, a show/hide toggle for password fields, and inline validation
 * text shown once the control is touched.
 *
 *   <bo-text-field [control]="form.controls.email" label="E-Mail"
 *                  type="email" icon="mail" errorText="Ungültige E-Mail" />
 */
@Component({
  selector: "bo-text-field",
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./text-field.component.html",
  styleUrl: "./text-field.component.css",
})
export class TextFieldComponent {
  readonly control = input.required<FormControl<string>>();
  readonly label = input<string>();
  readonly type = input<TextFieldType>("text");
  readonly icon = input<TextFieldIcon>("none");
  readonly placeholder = input("");
  readonly autocomplete = input<string>();
  readonly hint = input<string>();
  readonly errorText = input<string>();

  protected readonly fieldId = `tf-${++uid}`;
  protected readonly revealed = signal(false);

  protected readonly isPassword = computed(() => this.type() === "password");

  protected readonly inputType = computed(() =>
    this.isPassword() && this.revealed() ? "text" : this.type(),
  );

  protected readonly showError = computed(() => {
    const c = this.control();
    return c.touched && c.invalid;
  });

  protected readonly errorMessage = computed<string>(() => {
    const custom = this.errorText();
    if (custom) return custom;
    const errors = (this.control().errors ?? {}) as Record<
      string,
      { requiredLength?: number }
    >;
    if (errors["required"]) return "Pflichtfeld.";
    if (errors["email"]) return "Ungültige E-Mail-Adresse.";
    if (errors["minlength"])
      return `Mindestens ${errors["minlength"].requiredLength} Zeichen.`;
    if (errors["maxlength"])
      return `Höchstens ${errors["maxlength"].requiredLength} Zeichen.`;
    return "Ungültige Eingabe.";
  });

  protected readonly iconClass =
    "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400";

  protected inputClass(): string {
    const pl = this.icon() === "none" ? "pl-3" : "pl-9";
    const pr = this.isPassword() ? "pr-10" : "pr-3";
    const border = this.showError()
      ? "border-red-400"
      : "border-slate-300 focus:border-brand-500";
    return `w-full rounded-lg border bg-white py-2.5 ${pl} ${pr} text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-brand-100 ${border}`;
  }

  protected toggleReveal(): void {
    this.revealed.update((v) => !v);
  }
}

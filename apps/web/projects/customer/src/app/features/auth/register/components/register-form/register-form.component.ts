import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import type { RegisterRequest } from "@car-garage/shared";
import {
  AlertComponent,
  ButtonComponent,
  TextFieldComponent,
} from "../../../../../shared";

@Component({
  selector: "bo-register-form",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TextFieldComponent,
    ButtonComponent,
    AlertComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./register-form.component.html",
  styleUrl: "./register-form.component.css",
})
export class RegisterFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly loading = input(false);
  readonly error = input<string | null>(null);
  readonly submitted = output<RegisterRequest>();

  protected readonly form = this.fb.nonNullable.group({
    firstName: ["", [Validators.required]],
    lastName: ["", [Validators.required]],
    email: ["", [Validators.required, Validators.email]],
    password: ["", [Validators.required, Validators.minLength(8)]],
    phone: [""],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.submitted.emit({
      firstName: v.firstName.trim(),
      lastName: v.lastName.trim(),
      email: v.email.trim(),
      password: v.password,
      phone: v.phone.trim() || undefined,
    });
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { AlertComponent, ButtonComponent, TextFieldComponent } from "../../../../../shared";

export interface LoginCredentials {
  email: string;
  password: string;
}

@Component({
  selector: "bo-login-form",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TextFieldComponent,
    ButtonComponent,
    AlertComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./login-form.component.html",
  styleUrl: "./login-form.component.css",
})
export class LoginFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly loading = input(false);
  readonly error = input<string | null>(null);
  readonly submitted = output<LoginCredentials>();

  protected readonly form = this.fb.nonNullable.group({
    email: ["", [Validators.required, Validators.email]],
    password: ["", [Validators.required]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitted.emit(this.form.getRawValue());
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
} from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import type { AdminCustomer } from "@car-garage/shared";
import { ButtonComponent, TextFieldComponent } from "../../../../../shared";
import type { CustomerInput } from "../../../../../Store/customers";

@Component({
  selector: "bo-customer-edit",
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, TextFieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./customer-edit.component.html",
  styleUrl: "./customer-edit.component.css",
})
export class CustomerEditComponent {
  private readonly fb = inject(FormBuilder);

  readonly customer = input.required<AdminCustomer>();
  readonly saving = input(false);
  readonly save = output<CustomerInput>();
  readonly cancel = output<void>();

  protected readonly form = this.fb.nonNullable.group({
    firstName: ["", [Validators.required, Validators.minLength(1)]],
    lastName: ["", [Validators.required, Validators.minLength(1)]],
    phone: [""],
  });

  constructor() {
    effect(() => {
      const c = this.customer();
      this.form.setValue({
        firstName: c.firstName,
        lastName: c.lastName,
        phone: c.phone ?? "",
      });
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.save.emit({
      firstName: v.firstName.trim(),
      lastName: v.lastName.trim(),
      phone: v.phone.trim(),
    });
  }
}

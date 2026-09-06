import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
} from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import type { Workshop } from "@car-garage/shared";
import { ButtonComponent, TextFieldComponent } from "../../../../shared";
import type { ProfileInput } from "../../../../Store/profile";

@Component({
  selector: "ws-profile-form",
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, TextFieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./profile-form.component.html",
  styleUrl: "./profile-form.component.css",
})
export class ProfileFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly workshop = input.required<Workshop>();
  readonly saving = input(false);
  readonly save = output<ProfileInput>();
  readonly cancel = output<void>();

  protected readonly form = this.fb.nonNullable.group({
    name: ["", [Validators.required, Validators.minLength(2)]],
    description: [""],
    email: ["", [Validators.email]],
    phone: [""],
    address: this.fb.nonNullable.group({
      street: ["", [Validators.required]],
      city: ["", [Validators.required]],
      postalCode: ["", [Validators.required]],
      country: ["DE", [Validators.required]],
    }),
  });

  constructor() {
    effect(() => {
      const w = this.workshop();
      this.form.setValue({
        name: w.name,
        description: w.description ?? "",
        email: w.email ?? "",
        phone: w.phone ?? "",
        address: { ...w.address },
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
      name: v.name.trim(),
      description: v.description.trim() || undefined,
      email: v.email.trim() || undefined,
      phone: v.phone.trim() || undefined,
      address: {
        street: v.address.street.trim(),
        city: v.address.city.trim(),
        postalCode: v.address.postalCode.trim(),
        country: v.address.country.trim().toUpperCase(),
      },
    });
  }
}

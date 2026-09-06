import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import {
  AlertComponent,
  ButtonComponent,
  TextFieldComponent,
} from "../../../shared";
import { WorkshopsFacade } from "../../../Store/workshops";
import type { WorkshopInput } from "../../../Store/workshops";

@Component({
  selector: "bo-workshop-form",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AlertComponent,
    ButtonComponent,
    TextFieldComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./form.component.html",
})
export class WorkshopFormComponent {
  private readonly fb = inject(FormBuilder);
  protected readonly facade = inject(WorkshopsFacade);

  /** Route param `:id` — present in edit mode. */
  readonly id = input<string>();
  protected readonly isEdit = computed(() => !!this.id());

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
    lat: [null as number | null],
    lng: [null as number | null],
  });

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) this.facade.loadDetail(id);
    });

    effect(() => {
      const w = this.facade.selected();
      if (!w || w.id !== this.id()) return;
      this.form.patchValue({
        name: w.name,
        description: w.description ?? "",
        email: w.email ?? "",
        phone: w.phone ?? "",
        address: { ...w.address },
        lat: w.location?.lat ?? null,
        lng: w.location?.lng ?? null,
      });
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const input: WorkshopInput = {
      name: v.name.trim(),
      description: v.description.trim() || undefined,
      email: v.email.trim() || undefined,
      phone: v.phone.trim() || undefined,
      address: v.address,
      location:
        v.lat != null && v.lng != null
          ? { lat: v.lat, lng: v.lng }
          : undefined,
    };

    const id = this.id();
    if (id) this.facade.update(id, input);
    else this.facade.create(input);
  }
}

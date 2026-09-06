import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ButtonComponent } from "../../../../shared";
import type { CreateSlotInput } from "../../../../Store/availability";

const DURATIONS = [30, 45, 60, 90, 120] as const;

/** Local `yyyy-mm-dd` for a Date. */
function toDateInput(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

/** Local `HH:mm` for a Date. */
function toTimeInput(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes(),
  ).padStart(2, "0")}`;
}

@Component({
  selector: "ws-slot-form",
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./slot-form.component.html",
  styleUrl: "./slot-form.component.css",
})
export class SlotFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly saving = input(false);
  readonly create = output<CreateSlotInput>();

  protected readonly durations = DURATIONS;
  protected readonly localError = signal<string | null>(null);

  private readonly nextHour = (() => {
    const d = new Date();
    d.setHours(d.getHours() + 1, 0, 0, 0);
    return d;
  })();

  protected readonly form = this.fb.nonNullable.group({
    date: [toDateInput(this.nextHour), [Validators.required]],
    time: [toTimeInput(this.nextHour), [Validators.required]],
    durationMinutes: [60, [Validators.required]],
  });

  protected readonly minDate = computed(() => toDateInput(new Date()));

  submit(): void {
    this.localError.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { date, time, durationMinutes } = this.form.getRawValue();
    const startsAt = new Date(`${date}T${time}`);
    if (Number.isNaN(startsAt.getTime())) {
      this.localError.set("Ungültiges Datum oder Uhrzeit.");
      return;
    }
    if (startsAt.getTime() <= Date.now()) {
      this.localError.set("Das Zeitfenster muss in der Zukunft liegen.");
      return;
    }
    this.create.emit({
      startsAt: startsAt.toISOString(),
      durationMinutes: Number(durationMinutes),
    });
  }
}

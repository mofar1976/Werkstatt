import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import {
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { startWith } from "rxjs";
import { LineItemKind, PartAction, type RepairOrder } from "@car-garage/shared";
import { ButtonComponent, formatEur } from "../../../../../shared";
import type { DiagnosisInput } from "../../../../../Store/repair-orders";

interface LineItemRow {
  kind: LineItemKind;
  partAction: PartAction;
  description: string;
  quantity: number | string;
  unitPriceEur: number | string;
}

@Component({
  selector: "ws-diagnosis-editor",
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./diagnosis-editor.component.html",
  styleUrl: "./diagnosis-editor.component.css",
})
export class DiagnosisEditorComponent {
  private readonly fb = inject(FormBuilder);

  readonly order = input.required<RepairOrder>();
  readonly saving = input(false);
  readonly save = output<DiagnosisInput>();
  readonly send = output<void>();

  protected readonly Kind = LineItemKind;
  protected readonly Action = PartAction;
  protected readonly eur = formatEur;

  protected readonly form = this.fb.nonNullable.group({
    cause: ["", [Validators.required, Validators.minLength(3)]],
    taxRatePercent: [19, [Validators.required, Validators.min(0), Validators.max(25)]],
    notes: [""],
    lineItems: this.fb.array<ReturnType<DiagnosisEditorComponent["newRow"]>>([]),
  });

  private readonly value = toSignal(
    this.form.valueChanges.pipe(startWith(this.form.getRawValue())),
    { initialValue: this.form.getRawValue() },
  );

  /** Live gross-total preview from the current form values. */
  protected readonly grossPreview = computed(() => {
    const v = this.value();
    const rows = (v.lineItems ?? []) as LineItemRow[];
    const net = rows.reduce(
      (sum, r) => sum + Math.round(Number(r.quantity) * Number(r.unitPriceEur) * 100),
      0,
    );
    const rate = Number(v.taxRatePercent) || 0;
    return net + Math.round((net * rate) / 100);
  });

  /** The estimate can be sent once a persisted cause + at least one persisted line exist. */
  protected readonly canSend = computed(() => {
    const o = this.order();
    return !!o.cause && o.quote.lineItems.length > 0;
  });

  protected get lineItems(): FormArray {
    return this.form.controls.lineItems as unknown as FormArray;
  }

  constructor() {
    effect(() => {
      const o = this.order();
      this.form.controls.cause.setValue(o.cause ?? "");
      this.form.controls.taxRatePercent.setValue(o.quote.taxRatePercent || 19);
      this.form.controls.notes.setValue(o.quote.notes ?? "");
      this.lineItems.clear();
      for (const li of o.quote.lineItems) {
        this.lineItems.push(
          this.newRow(
            li.kind,
            li.partAction ?? PartAction.REPLACE,
            li.description,
            li.quantity,
            li.unitPriceCents / 100,
          ),
        );
      }
      if (o.quote.lineItems.length === 0) this.addRow();
    });
  }

  private newRow(
    kind: LineItemKind = LineItemKind.PART,
    partAction: PartAction = PartAction.REPLACE,
    description = "",
    quantity: number = 1,
    unitPriceEur: number = 0,
  ) {
    return this.fb.nonNullable.group({
      kind: [kind],
      partAction: [partAction],
      description: [description, [Validators.required]],
      quantity: [quantity, [Validators.required, Validators.min(0.01)]],
      unitPriceEur: [unitPriceEur, [Validators.required, Validators.min(0)]],
    });
  }

  addRow(): void {
    this.lineItems.push(this.newRow());
  }

  removeRow(i: number): void {
    this.lineItems.removeAt(i);
  }

  private toInput(): DiagnosisInput {
    const v = this.form.getRawValue();
    return {
      cause: v.cause.trim() || undefined,
      quote: {
        taxRatePercent: Number(v.taxRatePercent),
        notes: v.notes.trim() || undefined,
        lineItems: (v.lineItems as unknown as LineItemRow[]).map((li) => ({
          kind: li.kind,
          partAction: li.kind === LineItemKind.PART ? li.partAction : undefined,
          description: String(li.description).trim(),
          quantity: Number(li.quantity),
          unitPriceCents: Math.round(Number(li.unitPriceEur) * 100),
        })),
      },
    };
  }

  submitSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.save.emit(this.toInput());
  }
}

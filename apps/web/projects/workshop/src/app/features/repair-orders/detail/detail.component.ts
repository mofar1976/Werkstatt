import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  signal,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import {
  REPAIR_ORDER_STATUS_LABELS_DE,
  RepairOrderStatus,
  type RepairOrderStatus as Status,
} from "@car-garage/shared";
import {
  AlertComponent,
  BadgeComponent,
  ButtonComponent,
  SpinnerComponent,
  type BadgeTone,
} from "../../../shared";
import { RepairOrdersFacade } from "../../../Store/repair-orders";
import type { DiagnosisInput } from "../../../Store/repair-orders";
import { DiagnosisEditorComponent } from "./components/diagnosis-editor/diagnosis-editor.component";
import { QuoteViewComponent } from "./components/quote-view/quote-view.component";
import { AssigneePickerComponent } from "./components/assignee-picker/assignee-picker.component";
import { RepairTimelineComponent } from "./components/repair-timeline/repair-timeline.component";

const TRANSITIONS: Partial<Record<Status, Status[]>> = {
  [RepairOrderStatus.QUOTE_APPROVED]: [RepairOrderStatus.REPAIR_IN_PROGRESS],
  [RepairOrderStatus.REPAIR_IN_PROGRESS]: [
    RepairOrderStatus.WAITING_FOR_PARTS,
    RepairOrderStatus.REPAIR_COMPLETED,
  ],
  [RepairOrderStatus.WAITING_FOR_PARTS]: [
    RepairOrderStatus.REPAIR_IN_PROGRESS,
    RepairOrderStatus.REPAIR_COMPLETED,
  ],
  [RepairOrderStatus.REPAIR_COMPLETED]: [RepairOrderStatus.READY_FOR_PICKUP],
  [RepairOrderStatus.READY_FOR_PICKUP]: [RepairOrderStatus.CLOSED],
};

const TERMINAL: Status[] = [
  RepairOrderStatus.CLOSED,
  RepairOrderStatus.CANCELLED,
  RepairOrderStatus.QUOTE_REJECTED,
];

const TONE: Record<Status, BadgeTone> = {
  INTAKE_PENDING: "gray",
  INTAKE_SUBMITTED: "gray",
  VEHICLE_RECEIVED: "blue",
  DIAGNOSIS_IN_PROGRESS: "blue",
  QUOTE_PENDING_APPROVAL: "amber",
  QUOTE_APPROVED: "blue",
  QUOTE_REJECTED: "red",
  REPAIR_IN_PROGRESS: "blue",
  WAITING_FOR_PARTS: "amber",
  REPAIR_COMPLETED: "green",
  READY_FOR_PICKUP: "green",
  CLOSED: "gray",
  CANCELLED: "gray",
};

@Component({
  selector: "ws-repair-order-detail",
  standalone: true,
  imports: [
    RouterLink,
    AlertComponent,
    BadgeComponent,
    ButtonComponent,
    SpinnerComponent,
    DiagnosisEditorComponent,
    QuoteViewComponent,
    AssigneePickerComponent,
    RepairTimelineComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./detail.component.html",
})
export class RepairOrderDetailComponent {
  protected readonly facade = inject(RepairOrdersFacade);

  readonly id = input.required<string>();

  protected readonly order = this.facade.selected;
  protected readonly label = REPAIR_ORDER_STATUS_LABELS_DE;
  protected readonly noteDraft = signal("");

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) this.facade.loadDetail(id);
    });
    inject(DestroyRef).onDestroy(() => this.facade.leaveDetail());
  }

  protected readonly customerName = computed(() => {
    const c = this.order()?.customer;
    return c ? `${c.firstName} ${c.lastName}` : "—";
  });

  protected readonly isTerminal = computed(() =>
    TERMINAL.includes(this.order()?.status as Status),
  );

  protected readonly canEditDiagnosis = computed(() => {
    const o = this.order();
    return (
      !!o &&
      o.quote.status === "DRAFT" &&
      (o.status === RepairOrderStatus.VEHICLE_RECEIVED ||
        o.status === RepairOrderStatus.DIAGNOSIS_IN_PROGRESS)
    );
  });

  protected readonly nextSteps = computed(() => {
    const o = this.order();
    if (!o) return [];
    return (TRANSITIONS[o.status] ?? []).map((to) => ({
      to,
      label: this.verb(o.status, to),
    }));
  });

  tone(status: Status): BadgeTone {
    return TONE[status];
  }

  private verb(from: Status, to: Status): string {
    if (to === RepairOrderStatus.REPAIR_IN_PROGRESS) {
      return from === RepairOrderStatus.WAITING_FOR_PARTS
        ? "Weiter reparieren"
        : "Reparatur starten";
    }
    const map: Partial<Record<Status, string>> = {
      [RepairOrderStatus.WAITING_FOR_PARTS]: "Auf Teile warten",
      [RepairOrderStatus.REPAIR_COMPLETED]: "Reparatur abschließen",
      [RepairOrderStatus.READY_FOR_PICKUP]: "Als abholbereit markieren",
      [RepairOrderStatus.CLOSED]: "Auto übergeben & abschließen",
    };
    return map[to] ?? this.label[to];
  }

  advance(to: Status): void {
    const note = prompt("Notiz zu diesem Schritt (optional):");
    this.facade.advanceStatus(this.id(), to, note?.trim() || undefined);
  }

  saveDiagnosis(input: DiagnosisInput): void {
    this.facade.saveDiagnosis(this.id(), input);
  }

  sendQuote(): void {
    this.facade.sendQuote(this.id());
  }

  applyAssignees(memberIds: string[]): void {
    this.facade.setAssignees(this.id(), memberIds);
  }

  addNote(): void {
    const message = this.noteDraft().trim();
    if (!message) return;
    this.facade.addNote(this.id(), message);
    this.noteDraft.set("");
  }

  cancel(): void {
    const reason = prompt(
      "Grund für den Abbruch (optional, wird der Kundschaft angezeigt):",
    );
    if (reason === null) return;
    this.facade.cancel(this.id(), reason.trim() || undefined);
  }
}

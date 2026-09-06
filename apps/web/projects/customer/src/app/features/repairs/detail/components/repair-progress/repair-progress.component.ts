import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import {
  REPAIR_ORDER_FLOW,
  REPAIR_ORDER_STATUS_LABELS_DE,
  RepairOrderStatus,
} from "@car-garage/shared";

/** Visible happy-path steps for the customer (intake steps are hidden). */
const STEPS = REPAIR_ORDER_FLOW.slice(
  REPAIR_ORDER_FLOW.indexOf(RepairOrderStatus.VEHICLE_RECEIVED),
);

type StepState = "done" | "current" | "upcoming" | "rejected";

interface Step {
  status: RepairOrderStatus;
  label: string;
  state: StepState;
}

@Component({
  selector: "cu-repair-progress",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./repair-progress.component.html",
  styleUrl: "./repair-progress.component.css",
})
export class RepairProgressComponent {
  readonly status = input.required<RepairOrderStatus>();

  protected readonly isCancelled = computed(
    () => this.status() === RepairOrderStatus.CANCELLED,
  );
  protected readonly isRejected = computed(
    () => this.status() === RepairOrderStatus.QUOTE_REJECTED,
  );
  protected readonly waitingForParts = computed(
    () => this.status() === RepairOrderStatus.WAITING_FOR_PARTS,
  );

  private readonly currentIndex = computed(() => {
    const s = this.status();
    const direct = STEPS.indexOf(s);
    if (direct >= 0) return direct;
    if (s === RepairOrderStatus.WAITING_FOR_PARTS) {
      return STEPS.indexOf(RepairOrderStatus.REPAIR_IN_PROGRESS);
    }
    if (s === RepairOrderStatus.QUOTE_REJECTED) {
      return STEPS.indexOf(RepairOrderStatus.QUOTE_PENDING_APPROVAL);
    }
    return -1;
  });

  protected readonly steps = computed<Step[]>(() => {
    const current = this.currentIndex();
    const rejected = this.isRejected();
    return STEPS.map((status, i) => ({
      status,
      label: REPAIR_ORDER_STATUS_LABELS_DE[status],
      state:
        rejected && i === current
          ? "rejected"
          : i < current
            ? "done"
            : i === current
              ? "current"
              : "upcoming",
    }));
  });
}

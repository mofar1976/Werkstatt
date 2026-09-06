import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from "@angular/core";
import {
  APPOINTMENT_SLOT_STATUS_LABELS_DE,
  AppointmentSlotStatus,
  type AppointmentSlot,
} from "@car-garage/shared";
import { BadgeComponent, ButtonComponent, type BadgeTone } from "../../../../shared";
import { AvailabilityFacade } from "../../../../Store/availability";

interface SlotDay {
  key: string;
  label: string;
  slots: AppointmentSlot[];
}

const TONE: Record<AppointmentSlotStatus, BadgeTone> = {
  [AppointmentSlotStatus.OPEN]: "green",
  [AppointmentSlotStatus.BOOKED]: "blue",
  [AppointmentSlotStatus.BLOCKED]: "gray",
};

const dayFmt = new Intl.DateTimeFormat("de-DE", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});
const timeFmt = new Intl.DateTimeFormat("de-DE", {
  hour: "2-digit",
  minute: "2-digit",
});

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

@Component({
  selector: "ws-slot-list",
  standalone: true,
  imports: [BadgeComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./slot-list.component.html",
  styleUrl: "./slot-list.component.css",
})
export class SlotListComponent {
  private readonly facade = inject(AvailabilityFacade);

  readonly slots = input.required<AppointmentSlot[]>();
  readonly saving = input(false);

  protected readonly Status = AppointmentSlotStatus;
  protected readonly statusLabel = APPOINTMENT_SLOT_STATUS_LABELS_DE;

  protected readonly days = computed<SlotDay[]>(() => {
    const groups = new Map<string, SlotDay>();
    for (const slot of this.slots()) {
      const start = new Date(slot.startsAt);
      const key = dayKey(start);
      let group = groups.get(key);
      if (!group) {
        group = { key, label: this.dayLabel(start), slots: [] };
        groups.set(key, group);
      }
      group.slots.push(slot);
    }
    return [...groups.values()];
  });

  tone(status: AppointmentSlotStatus): BadgeTone {
    return TONE[status];
  }

  range(slot: AppointmentSlot): string {
    return `${timeFmt.format(new Date(slot.startsAt))}–${timeFmt.format(
      new Date(slot.endsAt),
    )}`;
  }

  block(slot: AppointmentSlot): void {
    this.facade.setStatus(slot.id, "BLOCKED");
  }

  release(slot: AppointmentSlot): void {
    this.facade.setStatus(slot.id, "OPEN");
  }

  remove(slot: AppointmentSlot): void {
    if (confirm(`Zeitfenster ${this.range(slot)} wirklich löschen?`)) {
      this.facade.deleteSlot(slot.id);
    }
  }

  private dayLabel(d: Date): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.round(
      (new Date(d).setHours(0, 0, 0, 0) - today.getTime()) / 86_400_000,
    );
    if (diffDays === 0) return "Heute";
    if (diffDays === 1) return "Morgen";
    return dayFmt.format(d);
  }
}

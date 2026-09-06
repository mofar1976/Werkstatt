import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from "@angular/core";
import type { PublicSlot } from "@car-garage/shared";
import { formatDate, formatTime } from "../../../../shared";

interface SlotDay {
  key: string;
  label: string;
  slots: PublicSlot[];
}

@Component({
  selector: "cu-slot-picker",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./slot-picker.component.html",
  styleUrl: "./slot-picker.component.css",
})
export class SlotPickerComponent {
  readonly slots = input.required<PublicSlot[]>();
  readonly selectedId = input<string | null>(null);

  readonly select = output<string>();

  protected readonly time = formatTime;

  protected readonly days = computed<SlotDay[]>(() => {
    const groups = new Map<string, SlotDay>();
    for (const slot of [...this.slots()].sort((a, b) =>
      a.startsAt.localeCompare(b.startsAt),
    )) {
      const key = slot.startsAt.slice(0, 10);
      let day = groups.get(key);
      if (!day) {
        day = { key, label: formatDate(slot.startsAt), slots: [] };
        groups.set(key, day);
      }
      day.slots.push(slot);
    }
    return [...groups.values()];
  });

  slotClass(id: string): string {
    const base =
      "rounded-lg border px-3 py-2 text-sm font-medium tabular-nums transition focus:outline-none focus:ring-2 focus:ring-brand-100";
    return id === this.selectedId()
      ? `${base} border-brand-500 bg-brand-600 text-white`
      : `${base} border-slate-300 bg-white text-slate-700 hover:border-brand-400`;
  }
}

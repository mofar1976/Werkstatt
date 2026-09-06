import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { AppointmentStatus, type Appointment } from "@car-garage/shared";
import { SpinnerComponent } from "../../../../../shared";

interface DayCell {
  date: Date | null;
  day: number;
  isToday: boolean;
  appointments: Appointment[];
}

const monthFmt = new Intl.DateTimeFormat("de-DE", {
  month: "long",
  year: "numeric",
});
const timeFmt = new Intl.DateTimeFormat("de-DE", {
  hour: "2-digit",
  minute: "2-digit",
});

const CHIP_CLASS: Record<AppointmentStatus, string> = {
  [AppointmentStatus.CONFIRMED]: "bg-brand-50 text-brand-700 hover:bg-brand-100",
  [AppointmentStatus.COMPLETED]:
    "bg-green-100 text-green-700 hover:bg-green-200",
  [AppointmentStatus.CANCELLED]:
    "bg-slate-100 text-slate-400 line-through hover:bg-slate-200",
};

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

@Component({
  selector: "ws-appointments-calendar",
  standalone: true,
  imports: [RouterLink, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./appointments-calendar.component.html",
  styleUrl: "./appointments-calendar.component.css",
})
export class AppointmentsCalendarComponent {
  readonly month = input.required<string>();
  readonly appointments = input.required<Appointment[]>();
  readonly loading = input(false);
  readonly monthShift = output<number>();

  protected readonly weekdays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

  protected readonly title = computed(() => {
    const [year, m] = this.month().split("-").map(Number);
    return monthFmt.format(new Date(year, m - 1, 1));
  });

  protected readonly weeks = computed<DayCell[][]>(() => {
    const [year, m] = this.month().split("-").map(Number);
    const monthIndex = m - 1;

    const byDay = new Map<string, Appointment[]>();
    for (const a of this.appointments()) {
      const key = dayKey(new Date(a.scheduledAt));
      const list = byDay.get(key);
      if (list) list.push(a);
      else byDay.set(key, [a]);
    }
    for (const list of byDay.values()) {
      list.sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
    }

    const first = new Date(year, monthIndex, 1);
    const leading = (first.getDay() + 6) % 7; // Monday-first
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const todayKey = dayKey(new Date());

    const cells: DayCell[] = [];
    for (let i = 0; i < leading; i++) {
      cells.push({ date: null, day: 0, isToday: false, appointments: [] });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, monthIndex, d);
      const key = dayKey(date);
      cells.push({
        date,
        day: d,
        isToday: key === todayKey,
        appointments: byDay.get(key) ?? [],
      });
    }
    while (cells.length % 7 !== 0) {
      cells.push({ date: null, day: 0, isToday: false, appointments: [] });
    }

    const weeks: DayCell[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    return weeks;
  });

  chipClass(a: Appointment): string {
    return CHIP_CLASS[a.status];
  }

  chipLabel(a: Appointment): string {
    const name = a.customer?.lastName ?? a.vehicle.brandName;
    return `${timeFmt.format(new Date(a.scheduledAt))} ${name}`;
  }
}

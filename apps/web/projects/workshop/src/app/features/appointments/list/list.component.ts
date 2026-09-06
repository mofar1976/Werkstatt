import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from "@angular/core";
import { AlertComponent, PaginationComponent, SpinnerComponent } from "../../../shared";
import { AppointmentsFacade } from "../../../Store/appointments";
import { AppointmentsToolbarComponent } from "./components/appointments-toolbar/appointments-toolbar.component";
import { AppointmentsTableComponent } from "./components/appointments-table/appointments-table.component";
import { AppointmentsCalendarComponent } from "./components/appointments-calendar/appointments-calendar.component";

type View = "list" | "calendar";

@Component({
  selector: "ws-appointment-list",
  standalone: true,
  imports: [
    AlertComponent,
    PaginationComponent,
    SpinnerComponent,
    AppointmentsToolbarComponent,
    AppointmentsTableComponent,
    AppointmentsCalendarComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./list.component.html",
})
export class AppointmentListComponent {
  protected readonly facade = inject(AppointmentsFacade);

  protected readonly view = signal<View>("list");

  constructor() {
    this.facade.open();
    // Load the month overview the first time the calendar becomes visible
    // (and refresh it whenever the user switches back to it).
    effect(() => {
      if (this.view() === "calendar") this.facade.openCalendar();
    });
  }

  setView(view: View): void {
    this.view.set(view);
  }
}

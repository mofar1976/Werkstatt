import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import {
  AlertComponent,
  PaginationComponent,
  SpinnerComponent,
} from "../../../shared";
import { AppointmentsFacade } from "../../../Store/appointments";
import { AppointmentStatusFilterComponent } from "./components/appointment-status-filter/appointment-status-filter.component";
import { AppointmentsListComponent } from "./components/appointments-list/appointments-list.component";

@Component({
  selector: "cu-appointment-list",
  standalone: true,
  imports: [
    RouterLink,
    AlertComponent,
    PaginationComponent,
    SpinnerComponent,
    AppointmentStatusFilterComponent,
    AppointmentsListComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./list.component.html",
})
export class AppointmentListComponent {
  protected readonly facade = inject(AppointmentsFacade);

  constructor() {
    this.facade.open();
  }
}

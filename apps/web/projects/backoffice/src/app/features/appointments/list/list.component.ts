import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import {
  AlertComponent,
  PaginationComponent,
  SpinnerComponent,
} from "../../../shared";
import { AppointmentsFacade } from "../../../Store/appointments";
import { AppointmentsToolbarComponent } from "./components/appointments-toolbar/appointments-toolbar.component";
import { AppointmentsTableComponent } from "./components/appointments-table/appointments-table.component";

@Component({
  selector: "bo-appointment-list",
  standalone: true,
  imports: [
    AlertComponent,
    PaginationComponent,
    SpinnerComponent,
    AppointmentsToolbarComponent,
    AppointmentsTableComponent,
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

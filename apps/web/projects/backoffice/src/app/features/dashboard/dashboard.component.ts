import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { AlertComponent, SpinnerComponent } from "../../shared";
import { AuthFacade } from "../../Store/auth";
import { DashboardFacade } from "../../Store/dashboard";
import { StatCardComponent } from "./components/stat-card/stat-card.component";
import { PendingWorkshopsComponent } from "./components/pending-workshops/pending-workshops.component";
import { RecentAppointmentsComponent } from "./components/recent-appointments/recent-appointments.component";

@Component({
  selector: "bo-dashboard",
  standalone: true,
  imports: [
    AlertComponent,
    SpinnerComponent,
    StatCardComponent,
    PendingWorkshopsComponent,
    RecentAppointmentsComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./dashboard.component.html",
})
export class DashboardComponent {
  protected readonly auth = inject(AuthFacade);
  protected readonly facade = inject(DashboardFacade);

  constructor() {
    this.facade.open();
  }
}

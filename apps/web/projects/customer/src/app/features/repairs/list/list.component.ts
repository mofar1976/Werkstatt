import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import {
  AlertComponent,
  PaginationComponent,
  SpinnerComponent,
} from "../../../shared";
import { RepairsFacade } from "../../../Store/repairs";
import { RepairStatusFilterComponent } from "./components/repair-status-filter/repair-status-filter.component";
import { RepairsListComponent } from "./components/repairs-list/repairs-list.component";

@Component({
  selector: "cu-repair-list",
  standalone: true,
  imports: [
    AlertComponent,
    PaginationComponent,
    SpinnerComponent,
    RepairStatusFilterComponent,
    RepairsListComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./list.component.html",
})
export class RepairListComponent {
  protected readonly facade = inject(RepairsFacade);

  constructor() {
    this.facade.open();
  }
}

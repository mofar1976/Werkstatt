import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import {
  AlertComponent,
  PaginationComponent,
  SpinnerComponent,
} from "../../../shared";
import { RepairsFacade } from "../../../Store/repairs";
import { RepairsToolbarComponent } from "./components/repairs-toolbar/repairs-toolbar.component";
import { RepairsTableComponent } from "./components/repairs-table/repairs-table.component";

@Component({
  selector: "bo-repair-list",
  standalone: true,
  imports: [
    AlertComponent,
    PaginationComponent,
    SpinnerComponent,
    RepairsToolbarComponent,
    RepairsTableComponent,
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

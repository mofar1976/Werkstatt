import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import {
  AlertComponent,
  ButtonComponent,
  PaginationComponent,
  SpinnerComponent,
} from "../../../shared";
import { WorkshopsFacade } from "../../../Store/workshops";
import { WorkshopsToolbarComponent } from "./components/workshops-toolbar/workshops-toolbar.component";
import { WorkshopsTableComponent } from "./components/workshops-table/workshops-table.component";

@Component({
  selector: "bo-workshop-list",
  standalone: true,
  imports: [
    RouterLink,
    AlertComponent,
    ButtonComponent,
    PaginationComponent,
    SpinnerComponent,
    WorkshopsToolbarComponent,
    WorkshopsTableComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./list.component.html",
})
export class WorkshopListComponent {
  protected readonly facade = inject(WorkshopsFacade);

  constructor() {
    this.facade.open();
  }
}

import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { AlertComponent, SpinnerComponent } from "../../../shared";
import { WorkshopsFacade } from "../../../Store/workshops";
import { WorkshopSearchComponent } from "./components/workshop-search/workshop-search.component";
import { WorkshopMapComponent } from "./components/workshop-map/workshop-map.component";
import { WorkshopListComponent } from "./components/workshop-list/workshop-list.component";

@Component({
  selector: "cu-workshop-list-page",
  standalone: true,
  imports: [
    AlertComponent,
    SpinnerComponent,
    WorkshopSearchComponent,
    WorkshopMapComponent,
    WorkshopListComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./list.component.html",
})
export class WorkshopListPageComponent {
  protected readonly facade = inject(WorkshopsFacade);

  constructor() {
    this.facade.open();
  }

  searchAt(point: { lat: number; lng: number }): void {
    this.facade.searchNear(point.lat, point.lng);
  }
}

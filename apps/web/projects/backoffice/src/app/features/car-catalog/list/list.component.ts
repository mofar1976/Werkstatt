import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import {
  AlertComponent,
  ButtonComponent,
  PaginationComponent,
  SpinnerComponent,
} from "../../../shared";
import { CarCatalogFacade } from "../../../Store/car-catalog";
import { BrandsToolbarComponent } from "./components/brands-toolbar/brands-toolbar.component";
import { BrandsTableComponent } from "./components/brands-table/brands-table.component";

@Component({
  selector: "bo-brand-list",
  standalone: true,
  imports: [
    RouterLink,
    AlertComponent,
    ButtonComponent,
    PaginationComponent,
    SpinnerComponent,
    BrandsToolbarComponent,
    BrandsTableComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./list.component.html",
})
export class BrandListComponent {
  protected readonly facade = inject(CarCatalogFacade);

  constructor() {
    this.facade.open();
  }
}

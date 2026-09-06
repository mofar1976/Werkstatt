import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { DatePipe } from "@angular/common";
import { RouterLink } from "@angular/router";
import type { CarBrand } from "@car-garage/shared";

@Component({
  selector: "bo-brands-table",
  standalone: true,
  imports: [DatePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./brands-table.component.html",
  styleUrl: "./brands-table.component.css",
})
export class BrandsTableComponent {
  readonly brands = input.required<CarBrand[]>();
}

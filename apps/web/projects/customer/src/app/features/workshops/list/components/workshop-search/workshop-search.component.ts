import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";

/** Radius options (km) offered for the "near me" search. */
const RADIUS_OPTIONS = [10, 25, 50, 100, 200] as const;

@Component({
  selector: "cu-workshop-search",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./workshop-search.component.html",
  styleUrl: "./workshop-search.component.css",
})
export class WorkshopSearchComponent {
  readonly search = input("");
  readonly near = input(false);
  readonly radiusKm = input(25);

  readonly searchChange = output<string>();
  readonly radiusChange = output<number>();
  readonly clearNear = output<void>();

  protected readonly radiusOptions = RADIUS_OPTIONS;

  onSearch(value: string): void {
    this.searchChange.emit(value);
  }

  onRadius(value: string): void {
    this.radiusChange.emit(Number(value));
  }
}

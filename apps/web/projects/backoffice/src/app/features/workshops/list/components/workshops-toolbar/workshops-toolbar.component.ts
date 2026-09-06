import { ChangeDetectionStrategy, Component, output } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import {
  WORKSHOP_STATUS_LABELS_DE,
  WorkshopStatus,
} from "@car-garage/shared";
import { TextFieldComponent } from "../../../../../shared";

@Component({
  selector: "bo-workshops-toolbar",
  standalone: true,
  imports: [ReactiveFormsModule, TextFieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./workshops-toolbar.component.html",
  styleUrl: "./workshops-toolbar.component.css",
})
export class WorkshopsToolbarComponent {
  readonly searchChange = output<string>();
  readonly statusChange = output<WorkshopStatus | "">();

  protected readonly searchControl = new FormControl("", { nonNullable: true });
  protected readonly statuses = Object.values(WorkshopStatus);
  protected readonly labels = WORKSHOP_STATUS_LABELS_DE;

  constructor() {
    this.searchControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value) => this.searchChange.emit(value));
  }

  onStatus(value: string): void {
    this.statusChange.emit(value as WorkshopStatus | "");
  }
}

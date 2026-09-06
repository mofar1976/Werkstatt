import { ChangeDetectionStrategy, Component, output } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { TextFieldComponent } from "../../../../../shared";
import type { CustomerStatusFilter } from "../../../../../Store/customers";

@Component({
  selector: "bo-customers-toolbar",
  standalone: true,
  imports: [ReactiveFormsModule, TextFieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./customers-toolbar.component.html",
  styleUrl: "./customers-toolbar.component.css",
})
export class CustomersToolbarComponent {
  readonly searchChange = output<string>();
  readonly statusChange = output<CustomerStatusFilter>();

  protected readonly searchControl = new FormControl("", { nonNullable: true });

  constructor() {
    this.searchControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value) => this.searchChange.emit(value));
  }

  onStatus(value: string): void {
    this.statusChange.emit(value as CustomerStatusFilter);
  }
}

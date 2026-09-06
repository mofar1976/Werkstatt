import { ChangeDetectionStrategy, Component, output } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { TextFieldComponent } from "../../../../../shared";

@Component({
  selector: "bo-brands-toolbar",
  standalone: true,
  imports: [ReactiveFormsModule, TextFieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./brands-toolbar.component.html",
  styleUrl: "./brands-toolbar.component.css",
})
export class BrandsToolbarComponent {
  readonly searchChange = output<string>();

  protected readonly searchControl = new FormControl("", { nonNullable: true });

  constructor() {
    this.searchControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value) => this.searchChange.emit(value));
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from "@angular/core";
import { ButtonComponent } from "../button/button.component";

/**
 *   <bo-pagination [page]="page()" [pageSize]="20" [total]="total()"
 *                  (pageChange)="setPage($event)" />
 */
@Component({
  selector: "bo-pagination",
  standalone: true,
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./pagination.component.html",
  styleUrl: "./pagination.component.css",
})
export class PaginationComponent {
  readonly page = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly total = input.required<number>();
  readonly pageChange = output<number>();

  protected readonly lastPage = computed(() =>
    Math.max(1, Math.ceil(this.total() / this.pageSize())),
  );
  protected readonly from = computed(() =>
    this.total() === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1,
  );
  protected readonly to = computed(() =>
    Math.min(this.page() * this.pageSize(), this.total()),
  );

  prev(): void {
    if (this.page() > 1) this.pageChange.emit(this.page() - 1);
  }

  next(): void {
    if (this.page() < this.lastPage()) this.pageChange.emit(this.page() + 1);
  }
}

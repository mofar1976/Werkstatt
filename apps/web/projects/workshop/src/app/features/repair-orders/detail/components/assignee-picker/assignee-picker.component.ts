import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from "@angular/core";
import type { RepairAssignee } from "@car-garage/shared";
import { ButtonComponent } from "../../../../../shared";

@Component({
  selector: "ws-assignee-picker",
  standalone: true,
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./assignee-picker.component.html",
  styleUrl: "./assignee-picker.component.css",
})
export class AssigneePickerComponent {
  readonly members = input.required<RepairAssignee[]>();
  readonly selected = input.required<RepairAssignee[]>();
  readonly saving = input(false);
  readonly disabled = input(false);
  readonly apply = output<string[]>();

  private readonly picked = signal<Set<string>>(new Set());

  constructor() {
    effect(() => {
      this.picked.set(new Set(this.selected().map((m) => m.id)));
    });
  }

  protected readonly dirty = computed(() => {
    const current = new Set(this.selected().map((m) => m.id));
    const p = this.picked();
    if (current.size !== p.size) return true;
    for (const id of p) if (!current.has(id)) return true;
    return false;
  });

  isPicked(id: string): boolean {
    return this.picked().has(id);
  }

  toggle(id: string): void {
    this.picked.update((set) => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  submit(): void {
    this.apply.emit([...this.picked()]);
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from "@angular/core";
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import {
  WorkshopRole,
  type WorkshopMember,
} from "@car-garage/shared";
import {
  BadgeComponent,
  ButtonComponent,
  TextFieldComponent,
} from "../../../../../shared";
import { WorkshopsFacade } from "../../../../../Store/workshops";

@Component({
  selector: "bo-workshop-members",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    BadgeComponent,
    ButtonComponent,
    TextFieldComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./workshop-members.component.html",
  styleUrl: "./workshop-members.component.css",
})
export class WorkshopMembersComponent {
  private readonly fb = inject(FormBuilder);
  protected readonly facade = inject(WorkshopsFacade);

  readonly workshopId = input.required<string>();
  readonly members = input.required<WorkshopMember[]>();

  protected readonly WorkshopRole = WorkshopRole;
  protected readonly showForm = signal(false);
  protected readonly chefCount = computed(
    () => this.members().filter((m) => m.role === WorkshopRole.CHEF).length,
  );

  protected readonly form = this.fb.nonNullable.group({
    email: ["", [Validators.required, Validators.email]],
    firstName: ["", [Validators.required]],
    lastName: ["", [Validators.required]],
    password: ["", [Validators.required, Validators.minLength(8)]],
    role: [WorkshopRole.MEMBER as WorkshopRole],
  });

  add(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.facade.addMember(this.workshopId(), this.form.getRawValue());
    this.form.reset({ role: WorkshopRole.MEMBER });
    this.showForm.set(false);
  }

  toggleRole(member: WorkshopMember): void {
    const next =
      member.role === WorkshopRole.CHEF
        ? WorkshopRole.MEMBER
        : WorkshopRole.CHEF;
    this.facade.updateMemberRole(this.workshopId(), member.id, next);
  }

  remove(member: WorkshopMember): void {
    if (
      confirm(
        `${member.user.firstName} ${member.user.lastName} wirklich entfernen? Das Konto wird deaktiviert.`,
      )
    ) {
      this.facade.removeMember(this.workshopId(), member.id);
    }
  }
}

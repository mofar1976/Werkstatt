import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { WorkshopRole, type WorkshopMember } from "@car-garage/shared";
import {
  BadgeComponent,
  ButtonComponent,
  TextFieldComponent,
} from "../../../../shared";
import { TeamFacade } from "../../../../Store/team";

@Component({
  selector: "ws-team-members",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    BadgeComponent,
    ButtonComponent,
    TextFieldComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./team-members.component.html",
  styleUrl: "./team-members.component.css",
})
export class TeamMembersComponent {
  private readonly fb = inject(FormBuilder);
  protected readonly facade = inject(TeamFacade);

  readonly members = input.required<WorkshopMember[]>();
  readonly canManage = input(false);
  readonly currentUserId = input("");

  protected readonly WorkshopRole = WorkshopRole;
  protected readonly showAddForm = signal(false);
  protected readonly editingId = signal<string | null>(null);

  protected readonly addForm = this.fb.nonNullable.group({
    email: ["", [Validators.required, Validators.email]],
    firstName: ["", [Validators.required]],
    lastName: ["", [Validators.required]],
    password: ["", [Validators.required, Validators.minLength(8)]],
    role: [WorkshopRole.MEMBER as WorkshopRole],
  });

  protected readonly editForm = this.fb.nonNullable.group({
    firstName: ["", [Validators.required]],
    lastName: ["", [Validators.required]],
    phone: [""],
    role: [WorkshopRole.MEMBER as WorkshopRole],
  });

  isSelf(member: WorkshopMember): boolean {
    return member.user.id === this.currentUserId();
  }

  add(): void {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }
    this.facade.addMember(this.addForm.getRawValue());
    this.addForm.reset({ role: WorkshopRole.MEMBER });
    this.showAddForm.set(false);
  }

  startEdit(member: WorkshopMember): void {
    this.editForm.reset({
      firstName: member.user.firstName,
      lastName: member.user.lastName,
      phone: member.user.phone ?? "",
      role: member.role,
    });
    this.editingId.set(member.id);
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  saveEdit(member: WorkshopMember): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    const v = this.editForm.getRawValue();
    this.facade.updateMember(member.id, {
      firstName: v.firstName.trim(),
      lastName: v.lastName.trim(),
      phone: v.phone.trim(),
      // Own role can't be changed; the server rejects it anyway.
      ...(this.isSelf(member) ? {} : { role: v.role }),
    });
    this.editingId.set(null);
  }

  toggleRole(member: WorkshopMember): void {
    const next =
      member.role === WorkshopRole.CHEF
        ? WorkshopRole.MEMBER
        : WorkshopRole.CHEF;
    this.facade.updateMember(member.id, { role: next });
  }

  remove(member: WorkshopMember): void {
    if (
      confirm(
        `${member.user.firstName} ${member.user.lastName} wirklich entfernen? Das Konto wird deaktiviert.`,
      )
    ) {
      this.facade.removeMember(member.id);
    }
  }
}

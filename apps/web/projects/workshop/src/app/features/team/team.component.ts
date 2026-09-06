import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
} from "@angular/core";
import { UserRole } from "@car-garage/shared";
import { AlertComponent, SpinnerComponent } from "../../shared";
import { AuthFacade } from "../../Store/auth";
import { TeamFacade } from "../../Store/team";
import { TeamMembersComponent } from "./components/team-members/team-members.component";

@Component({
  selector: "ws-team",
  standalone: true,
  imports: [AlertComponent, SpinnerComponent, TeamMembersComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./team.component.html",
})
export class TeamComponent {
  protected readonly facade = inject(TeamFacade);
  private readonly auth = inject(AuthFacade);

  /** Only the workshop chef may add, promote or remove members. */
  protected readonly canManage = computed(() =>
    (this.auth.user()?.roles ?? []).includes(UserRole.WORKSHOP_ADMIN),
  );
  protected readonly currentUserId = computed(() => this.auth.user()?.id ?? "");

  constructor() {
    this.facade.open();
    inject(DestroyRef).onDestroy(() => this.facade.leave());
  }
}

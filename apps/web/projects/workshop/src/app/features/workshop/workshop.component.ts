import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from "@angular/core";
import { UserRole } from "@car-garage/shared";
import {
  AlertComponent,
  ButtonComponent,
  SpinnerComponent,
} from "../../shared";
import { AuthFacade } from "../../Store/auth";
import { ProfileFacade } from "../../Store/profile";
import type { ProfileInput } from "../../Store/profile";
import { ProfileViewComponent } from "./components/profile-view/profile-view.component";
import { ProfileFormComponent } from "./components/profile-form/profile-form.component";

@Component({
  selector: "ws-workshop-profile",
  standalone: true,
  imports: [
    AlertComponent,
    ButtonComponent,
    SpinnerComponent,
    ProfileViewComponent,
    ProfileFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./workshop.component.html",
})
export class WorkshopProfileComponent {
  protected readonly facade = inject(ProfileFacade);
  private readonly auth = inject(AuthFacade);

  /** Only the workshop chef may edit the profile. */
  protected readonly canEdit = computed(() =>
    (this.auth.user()?.roles ?? []).includes(UserRole.WORKSHOP_ADMIN),
  );
  protected readonly editing = signal(false);

  constructor() {
    this.facade.open();
  }

  save(input: ProfileInput): void {
    this.facade.save(input);
    // Close optimistically; a failed save surfaces in the error alert.
    this.editing.set(false);
  }
}

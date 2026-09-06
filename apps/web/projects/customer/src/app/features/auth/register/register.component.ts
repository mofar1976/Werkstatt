import { ChangeDetectionStrategy, Component, effect, inject } from "@angular/core";
import { Router } from "@angular/router";
import type { RegisterRequest } from "@car-garage/shared";
import { AuthFacade } from "../../../Store/auth";
import { ROUTES } from "../../../core/config";
import { BrandPanelComponent } from "../login/components/brand-panel/brand-panel.component";
import { RegisterFormComponent } from "./components/register-form/register-form.component";

@Component({
  selector: "bo-register",
  standalone: true,
  imports: [BrandPanelComponent, RegisterFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./register.component.html",
})
export class RegisterComponent {
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthFacade);

  constructor() {
    effect(() => {
      if (this.auth.isAuthenticated()) {
        void this.router.navigateByUrl(ROUTES.dashboard);
      }
    });
  }

  register(input: RegisterRequest): void {
    this.auth.register(input);
  }
}

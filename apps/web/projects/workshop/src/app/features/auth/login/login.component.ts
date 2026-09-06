import { ChangeDetectionStrategy, Component, effect, inject } from "@angular/core";
import { Router } from "@angular/router";
import { AuthFacade } from "../../../Store/auth";
import { ROUTES } from "../../../core/config";
import { BrandPanelComponent } from "./components/brand-panel/brand-panel.component";
import {
  LoginFormComponent,
  type LoginCredentials,
} from "./components/login-form/login-form.component";

@Component({
  selector: "bo-login",
  standalone: true,
  imports: [BrandPanelComponent, LoginFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./login.component.html",
})
export class LoginComponent {
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthFacade);

  constructor() {
    effect(() => {
      if (this.auth.isAuthenticated()) {
        void this.router.navigateByUrl(ROUTES.dashboard);
      }
    });
  }

  login(credentials: LoginCredentials): void {
    this.auth.login(credentials.email, credentials.password);
  }
}

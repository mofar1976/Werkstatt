import { ChangeDetectionStrategy, Component } from "@angular/core";

/** Decorative left-hand panel on the login screen (hidden below lg). */
@Component({
  selector: "bo-login-brand-panel",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./brand-panel.component.html",
  styleUrl: "./brand-panel.component.css",
})
export class BrandPanelComponent {
  protected readonly year = new Date().getFullYear();
}

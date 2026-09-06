import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { NAV_ITEMS } from "../../core/config";

@Component({
  selector: "bo-sidebar",
  standalone: true,
  imports: [NgTemplateOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./sidebar.component.html",
  styleUrl: "./sidebar.component.css",
})
export class SidebarComponent {
  /** Drawer open state (mobile only). */
  readonly open = input(false, { transform: booleanAttribute });
  readonly closed = output<void>();

  protected readonly items = NAV_ITEMS;

  protected readonly asideClass = computed(
    () =>
      "fixed inset-y-0 left-0 z-30 w-64 border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 " +
      (this.open() ? "translate-x-0" : "-translate-x-full"),
  );
}

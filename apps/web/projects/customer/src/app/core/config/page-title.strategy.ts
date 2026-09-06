import { Injectable, inject } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { TitleStrategy, type RouterStateSnapshot } from "@angular/router";

/** Sets the document title as "<page> · Auto-Werkstatt". */
@Injectable({ providedIn: "root" })
export class CustomerTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const page = this.buildTitle(snapshot);
    this.title.setTitle(page ? `${page} · Auto-Werkstatt` : "Auto-Werkstatt");
  }
}

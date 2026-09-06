import { Injectable, inject } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { TitleStrategy, type RouterStateSnapshot } from "@angular/router";

/** Sets the document title as "<page> · Werkstatt-Portal". */
@Injectable({ providedIn: "root" })
export class WorkshopTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const page = this.buildTitle(snapshot);
    this.title.setTitle(page ? `${page} · Werkstatt-Portal` : "Werkstatt-Portal");
  }
}

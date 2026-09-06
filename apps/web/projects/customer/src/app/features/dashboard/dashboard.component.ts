import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { AuthFacade } from "../../Store/auth";

@Component({
  selector: "cu-dashboard",
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="text-lg font-semibold text-slate-900">Übersicht</h1>
    <p class="mt-1 text-sm text-slate-500">
      Willkommen, {{ auth.user()?.firstName }}.
    </p>

    <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <a
        routerLink="/workshops"
        class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow"
      >
        <p class="text-sm font-medium text-slate-900">Werkstatt finden</p>
        <p class="mt-1 text-sm text-slate-500">Werkstatt in deiner Nähe suchen und Termin buchen</p>
      </a>

      <a
        routerLink="/appointments"
        class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow"
      >
        <p class="text-sm font-medium text-slate-900">Meine Termine</p>
        <p class="mt-1 text-sm text-slate-500">Gebuchte Termine ansehen oder stornieren</p>
      </a>

      <a
        routerLink="/repairs"
        class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow"
      >
        <p class="text-sm font-medium text-slate-900">Reparaturen</p>
        <p class="mt-1 text-sm text-slate-500">Kostenvoranschlag freigeben, Status verfolgen</p>
      </a>
    </div>
  `,
})
export class DashboardComponent {
  protected readonly auth = inject(AuthFacade);
}

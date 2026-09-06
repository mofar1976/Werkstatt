import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { AuthFacade } from "../../Store/auth";

@Component({
  selector: "ws-dashboard",
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="text-lg font-semibold text-slate-900">Übersicht</h1>
    <p class="mt-1 text-sm text-slate-500">
      Willkommen zurück, {{ auth.user()?.firstName }}.
    </p>

    <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <a
        routerLink="/appointments"
        class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow"
      >
        <p class="text-sm font-medium text-slate-900">Termine</p>
        <p class="mt-1 text-sm text-slate-500">Gebuchte Termine bearbeiten</p>
      </a>

      <a
        routerLink="/repair-orders"
        class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow"
      >
        <p class="text-sm font-medium text-slate-900">Reparaturen</p>
        <p class="mt-1 text-sm text-slate-500">Befund, Kostenvoranschlag, Reparaturverlauf</p>
      </a>

      <a
        routerLink="/availability"
        class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow"
      >
        <p class="text-sm font-medium text-slate-900">Verfügbarkeit</p>
        <p class="mt-1 text-sm text-slate-500">Freie Zeitfenster anlegen und pflegen</p>
      </a>

      <a
        routerLink="/team"
        class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow"
      >
        <p class="text-sm font-medium text-slate-900">Team</p>
        <p class="mt-1 text-sm text-slate-500">Mitarbeitende einsehen und verwalten</p>
      </a>

      <a
        routerLink="/workshop"
        class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow"
      >
        <p class="text-sm font-medium text-slate-900">Werkstatt</p>
        <p class="mt-1 text-sm text-slate-500">Profil und Kontaktdaten pflegen</p>
      </a>
    </div>
  `,
})
export class DashboardComponent {
  protected readonly auth = inject(AuthFacade);
}

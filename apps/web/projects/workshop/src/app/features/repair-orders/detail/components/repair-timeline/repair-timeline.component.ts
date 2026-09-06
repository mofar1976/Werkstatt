import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import {
  REPAIR_ORDER_STATUS_LABELS_DE,
  type RepairTimelineEvent,
} from "@car-garage/shared";

const TYPE_LABELS: Record<string, string> = {
  ORDER_CREATED: "Auftrag angelegt",
  STATUS_CHANGED: "Status geändert",
  NOTE_ADDED: "Notiz",
  DIAGNOSIS_ADDED: "Befund aktualisiert",
  QUOTE_SENT: "Kostenvoranschlag gesendet",
  QUOTE_APPROVED: "Kostenvoranschlag freigegeben",
  QUOTE_REJECTED: "Kostenvoranschlag abgelehnt",
};

const fmt = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

@Component({
  selector: "ws-repair-timeline",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./repair-timeline.component.html",
  styleUrl: "./repair-timeline.component.css",
})
export class RepairTimelineComponent {
  readonly events = input.required<RepairTimelineEvent[]>();

  title(e: RepairTimelineEvent): string {
    if (e.type === "STATUS_CHANGED" && e.status) {
      return REPAIR_ORDER_STATUS_LABELS_DE[e.status];
    }
    return TYPE_LABELS[e.type] ?? e.type;
  }

  when(iso: string): string {
    return fmt.format(new Date(iso));
  }

  actor(e: RepairTimelineEvent): string {
    const who =
      e.actor === "CUSTOMER"
        ? "Kundschaft"
        : e.actor === "SYSTEM"
          ? "System"
          : "Werkstatt";
    return e.actorName ? `${e.actorName} · ${who}` : who;
  }
}

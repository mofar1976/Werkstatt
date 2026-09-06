import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import {
  LineItemKind,
  PartAction,
  type RepairLineItem,
  type RepairQuote,
} from "@car-garage/shared";
import { formatEur } from "../../../../../shared";

@Component({
  selector: "cu-repair-quote",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./repair-quote.component.html",
  styleUrl: "./repair-quote.component.css",
})
export class RepairQuoteComponent {
  readonly quote = input.required<RepairQuote>();

  protected readonly eur = formatEur;

  lineLabel(item: RepairLineItem): string {
    if (item.kind === LineItemKind.LABOR) return "Arbeit";
    return item.partAction === PartAction.REPLACE
      ? "Teil ersetzen"
      : "Teil reparieren";
  }

  unit(item: RepairLineItem): string {
    return item.kind === LineItemKind.LABOR ? "Std." : "Stk.";
  }
}

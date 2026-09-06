import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import {
  LineItemKind,
  PartAction,
  type RepairLineItem,
  type RepairQuote,
} from "@car-garage/shared";
import { formatEur } from "../../../../../shared";

@Component({
  selector: "ws-quote-view",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./quote-view.component.html",
  styleUrl: "./quote-view.component.css",
})
export class QuoteViewComponent {
  readonly quote = input.required<RepairQuote>();

  protected readonly eur = formatEur;
  protected readonly Kind = LineItemKind;

  lineLabel(item: RepairLineItem): string {
    if (item.kind === LineItemKind.LABOR) return "Arbeit";
    return item.partAction === PartAction.REPLACE ? "Teil ersetzen" : "Teil reparieren";
  }

  unit(item: RepairLineItem): string {
    return item.kind === LineItemKind.LABOR ? "Std." : "Stk.";
  }
}

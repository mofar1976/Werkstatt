import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { RouterLink } from "@angular/router";

@Component({
  selector: "bo-stat-card",
  standalone: true,
  imports: [NgTemplateOutlet, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./stat-card.component.html",
  styleUrl: "./stat-card.component.css",
})
export class StatCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<number | string>();
  readonly hint = input<string>();
  /** When set, the whole card links here. */
  readonly link = input<string>();
}

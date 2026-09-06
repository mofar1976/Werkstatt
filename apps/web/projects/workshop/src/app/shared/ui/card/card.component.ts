import { ChangeDetectionStrategy, Component, input } from "@angular/core";

/** Simple bordered content card. */
@Component({
  selector: "bo-card",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./card.component.html",
  styleUrl: "./card.component.css",
})
export class CardComponent {
  readonly heading = input<string>();
}

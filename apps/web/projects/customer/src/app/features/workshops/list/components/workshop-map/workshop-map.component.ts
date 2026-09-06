import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from "@angular/core";
import * as L from "leaflet";
import type { PublicWorkshop } from "@car-garage/shared";

/** Roughly the geographic centre of Germany. */
const GERMANY: L.LatLngExpression = [51.163, 10.447];

@Component({
  selector: "cu-workshop-map",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./workshop-map.component.html",
  styleUrl: "./workshop-map.component.css",
})
export class WorkshopMapComponent {
  readonly workshops = input.required<PublicWorkshop[]>();
  readonly focusedId = input<string | null>(null);
  /** Hide the "my position" / "search this area" overlay (e.g. on the detail map). */
  readonly showControls = input(true);

  /** A marker was clicked. */
  readonly markerSelect = output<string>();
  /** The customer asked to search around a point (map centre or their location). */
  readonly searchHere = output<{ lat: number; lng: number }>();

  private readonly mapEl = viewChild.required<ElementRef<HTMLElement>>("map");
  private readonly ready = signal(false);
  protected readonly locating = signal(false);

  private map?: L.Map;
  private layer?: L.LayerGroup;
  private resizeObserver?: ResizeObserver;
  private readonly markers = new Map<string, L.Marker>();
  private fittedSignature = "";

  constructor() {
    afterNextRender(() => this.initMap());

    // Markers + auto-fit react to the result list.
    effect(() => {
      const list = this.workshops();
      if (this.ready()) this.renderMarkers(list);
    });
    // Highlight + pan react to the focused workshop.
    effect(() => {
      const id = this.focusedId();
      if (this.ready()) this.applyFocus(id);
    });

    inject(DestroyRef).onDestroy(() => {
      this.resizeObserver?.disconnect();
      this.map?.remove();
    });
  }

  private initMap(): void {
    const host = this.mapEl().nativeElement;

    this.map = L.map(host, {
      zoomControl: true,
      attributionControl: true,
    }).setView(GERMANY, 6);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap-Mitwirkende",
      maxZoom: 19,
    }).addTo(this.map);

    this.layer = L.layerGroup().addTo(this.map);
    this.ready.set(true);
    this.renderMarkers(this.workshops());
    this.applyFocus(this.focusedId());

    // Leaflet measures the container on init; if the layout is still settling
    // (grid, fonts) it caches a wrong size and only paints part of the tiles.
    // Recalculate once the element actually has its box, and on every resize.
    let firstResize = true;
    this.resizeObserver = new ResizeObserver(() => {
      this.map?.invalidateSize();
      // The initial fitBounds ran against a possibly-wrong size — redo it once.
      if (firstResize) {
        firstResize = false;
        this.fitToMarkers();
      }
    });
    this.resizeObserver.observe(host);
  }

  private fitToMarkers(): void {
    const points: L.LatLngExpression[] = [];
    for (const w of this.workshops()) {
      if (w.location) points.push([w.location.lat, w.location.lng]);
    }
    if (points.length > 0) {
      this.map?.fitBounds(L.latLngBounds(points), {
        padding: [48, 48],
        maxZoom: 13,
      });
    }
  }

  private renderMarkers(list: PublicWorkshop[]): void {
    this.layer?.clearLayers();
    this.markers.clear();

    const located = list.filter(
      (w): w is PublicWorkshop & { location: NonNullable<PublicWorkshop["location"]> } =>
        !!w.location,
    );

    for (const w of located) {
      const marker = L.marker([w.location.lat, w.location.lng], {
        icon: this.pin(false),
        title: w.name,
      });
      marker.bindTooltip(w.name, { direction: "top", offset: [0, -30] });
      marker.on("click", () => this.markerSelect.emit(w.id));
      marker.addTo(this.layer!);
      this.markers.set(w.id, marker);
    }

    const signature = located.map((w) => w.id).sort().join(",");
    if (located.length > 0 && signature !== this.fittedSignature) {
      this.fittedSignature = signature;
      this.fitToMarkers();
    }
  }

  private applyFocus(id: string | null): void {
    for (const [markerId, marker] of this.markers) {
      marker.setIcon(this.pin(markerId === id));
      if (markerId === id) {
        marker.setZIndexOffset(1000);
        this.map?.panTo(marker.getLatLng());
      } else {
        marker.setZIndexOffset(0);
      }
    }
  }

  private pin(active: boolean): L.DivIcon {
    const h = active ? 42 : 32;
    const w = Math.round(h * 0.7);
    const fill = active ? "#1d4ed8" : "#475569";
    return L.divIcon({
      className: "",
      html: `<svg width="${w}" height="${h}" viewBox="0 0 24 34" xmlns="http://www.w3.org/2000/svg">
        <path fill="${fill}" stroke="white" stroke-width="1.5"
          d="M12 .5C5.9.5 1 5.4 1 11.5c0 8 11 22 11 22s11-14 11-22C23 5.4 18.1.5 12 .5Z"/>
        <circle cx="12" cy="11.5" r="4" fill="white"/>
      </svg>`,
      iconSize: [w, h],
      iconAnchor: [w / 2, h],
      tooltipAnchor: [0, -h + 6],
    });
  }

  searchThisArea(): void {
    const c = this.map?.getCenter();
    if (c) this.searchHere.emit({ lat: c.lat, lng: c.lng });
  }

  locateMe(): void {
    if (!navigator.geolocation) return;
    this.locating.set(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.locating.set(false);
        const { latitude, longitude } = pos.coords;
        this.map?.setView([latitude, longitude], 11);
        this.searchHere.emit({ lat: latitude, lng: longitude });
      },
      () => this.locating.set(false),
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }
}

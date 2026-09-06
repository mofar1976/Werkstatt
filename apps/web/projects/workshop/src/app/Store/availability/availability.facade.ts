import { Injectable, inject } from "@angular/core";
import { Store } from "@ngrx/store";
import { AvailabilityActions } from "./availability.actions";
import type { CreateSlotInput } from "./availability.state";
import {
  selectSlots,
  selectSlotsError,
  selectSlotsLoading,
  selectSlotsSaving,
} from "./availability.selectors";

@Injectable({ providedIn: "root" })
export class AvailabilityFacade {
  private readonly store = inject(Store);

  readonly slots = this.store.selectSignal(selectSlots);
  readonly loading = this.store.selectSignal(selectSlotsLoading);
  readonly error = this.store.selectSignal(selectSlotsError);
  readonly saving = this.store.selectSignal(selectSlotsSaving);

  open(): void {
    this.store.dispatch(AvailabilityActions.opened());
  }
  leave(): void {
    this.store.dispatch(AvailabilityActions.leave());
  }

  createSlot(input: CreateSlotInput): void {
    this.store.dispatch(AvailabilityActions.createSlot({ input }));
  }
  setStatus(slotId: string, status: "OPEN" | "BLOCKED"): void {
    this.store.dispatch(AvailabilityActions.setSlotStatus({ slotId, status }));
  }
  deleteSlot(slotId: string): void {
    this.store.dispatch(AvailabilityActions.deleteSlot({ slotId }));
  }
}

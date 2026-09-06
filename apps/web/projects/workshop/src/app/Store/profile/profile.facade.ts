import { Injectable, inject } from "@angular/core";
import { Store } from "@ngrx/store";
import { ProfileActions } from "./profile.actions";
import type { ProfileInput } from "./profile.state";
import {
  selectProfileError,
  selectProfileLoading,
  selectProfileSaving,
  selectWorkshop,
} from "./profile.selectors";

@Injectable({ providedIn: "root" })
export class ProfileFacade {
  private readonly store = inject(Store);

  readonly workshop = this.store.selectSignal(selectWorkshop);
  readonly loading = this.store.selectSignal(selectProfileLoading);
  readonly error = this.store.selectSignal(selectProfileError);
  readonly saving = this.store.selectSignal(selectProfileSaving);

  open(): void {
    this.store.dispatch(ProfileActions.opened());
  }

  save(input: ProfileInput): void {
    this.store.dispatch(ProfileActions.save({ input }));
  }
}

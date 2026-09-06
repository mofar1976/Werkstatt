import { Injectable, inject } from "@angular/core";
import { Store } from "@ngrx/store";
import { TeamActions } from "./team.actions";
import type { AddMemberInput, UpdateMemberInput } from "./team.state";
import {
  selectTeamError,
  selectTeamLoading,
  selectTeamMembers,
  selectTeamSaving,
} from "./team.selectors";

@Injectable({ providedIn: "root" })
export class TeamFacade {
  private readonly store = inject(Store);

  readonly members = this.store.selectSignal(selectTeamMembers);
  readonly loading = this.store.selectSignal(selectTeamLoading);
  readonly error = this.store.selectSignal(selectTeamError);
  readonly saving = this.store.selectSignal(selectTeamSaving);

  open(): void {
    this.store.dispatch(TeamActions.opened());
  }
  leave(): void {
    this.store.dispatch(TeamActions.leave());
  }

  addMember(input: AddMemberInput): void {
    this.store.dispatch(TeamActions.addMember({ input }));
  }
  updateMember(memberId: string, input: UpdateMemberInput): void {
    this.store.dispatch(TeamActions.updateMember({ memberId, input }));
  }
  removeMember(memberId: string): void {
    this.store.dispatch(TeamActions.removeMember({ memberId }));
  }
}

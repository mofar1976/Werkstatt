import type { Routes } from "@angular/router";
import { provideState } from "@ngrx/store";
import { provideEffects } from "@ngrx/effects";
import {
  BOOKING_FEATURE_KEY,
  bookingEffects,
  bookingReducer,
} from "../../Store/booking";
import { BookingComponent } from "./booking.component";

export const bookingRoutes: Routes = [
  {
    path: ":workshopId",
    providers: [
      provideState(BOOKING_FEATURE_KEY, bookingReducer),
      provideEffects(bookingEffects),
    ],
    component: BookingComponent,
    title: "Termin vereinbaren",
  },
];

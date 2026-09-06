import type { Workshop } from "@car-garage/shared";

export const PROFILE_FEATURE_KEY = "profile";

export interface ProfileInput {
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

export interface ProfileState {
  workshop: Workshop | null;
  loading: boolean;
  error: string | null;
  saving: boolean;
}

export const initialProfileState: ProfileState = {
  workshop: null,
  loading: false,
  error: null,
  saving: false,
};

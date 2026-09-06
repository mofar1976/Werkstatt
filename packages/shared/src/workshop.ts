import type { WorkshopRole, WorkshopStatus } from "./enums";

export interface WorkshopAddress {
  street: string;
  city: string;
  postalCode: string;
  /** ISO 3166-1 alpha-2, e.g. "DE". */
  country: string;
}

export interface WorkshopGeoLocation {
  lat: number;
  lng: number;
}

export interface Workshop {
  id: string;
  name: string;
  slug: string;
  description?: string;
  email?: string;
  phone?: string;
  address: WorkshopAddress;
  location?: WorkshopGeoLocation;
  status: WorkshopStatus;
  /** Number of people assigned to the workshop (present in list/detail views). */
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Workshop projection shown to customers (no internal / admin fields). */
export interface PublicWorkshop {
  id: string;
  name: string;
  slug: string;
  description?: string;
  address: WorkshopAddress;
  location?: WorkshopGeoLocation;
  phone?: string;
  email?: string;
}

export interface WorkshopMemberUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface WorkshopMember {
  id: string;
  workshopId: string;
  role: WorkshopRole;
  user: WorkshopMemberUser;
  createdAt: string;
}

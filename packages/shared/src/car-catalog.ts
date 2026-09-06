/** Manually curated catalogue of car brands and their models. */

export interface CarBrand {
  id: string;
  name: string;
  slug: string;
  /** Public URL of the brand logo, if one has been uploaded. */
  logoUrl?: string;
  /** Number of live models under this brand (present in list/detail views). */
  modelCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CarModel {
  id: string;
  brandId: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

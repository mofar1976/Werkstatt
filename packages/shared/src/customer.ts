/** Customer accounts as seen by the platform admin in the Backoffice. */

export interface AdminCustomer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  /** false once an admin has blocked the account (login is refused). */
  isActive: boolean;
  /** Number of live appointments this customer has ever created. */
  appointmentCount: number;
  createdAt: string;
  updatedAt: string;
}

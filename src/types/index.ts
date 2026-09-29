export type BookingStatus = "pending" | "approved" | "rejected" | "cancelled";
export type PaymentMethod = "PayPal" | "Cash App" | "Zelle" | "Chime";
export type IdVerificationStatus = "pending" | "verified" | "failed" | "not_required";

export interface Car {
  id: string;
  name: string;
  description: string;
  price_per_day: number;
  images: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  car_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  pickup_address: string;
  dropoff_address: string;
  pickup_time: string;
  dropoff_time: string;
  payment_method: PaymentMethod;
  notes: string;
  status: BookingStatus;
  id_verification_status: IdVerificationStatus;
  created_at: string;
  updated_at: string;
  car?: Car;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: "customer" | "admin";
  created_at: string;
  updated_at: string;
}

export interface BookingFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  pickup_address: string;
  dropoff_address: string;
  pickup_time: string;
  dropoff_time: string;
  payment_method: PaymentMethod;
  notes: string;
}

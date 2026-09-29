"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { PAYMENT_METHODS, calculateDays, formatCurrency } from "@/lib/utils";
import type { PaymentMethod } from "@/types";
import { Shield, CreditCard, FileCheck } from "lucide-react";

interface BookingFormProps {
  carId: string;
  pricePerDay: number;
}

export default function BookingForm({ carId, pricePerDay }: BookingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    pickup_address: "",
    dropoff_address: "",
    pickup_time: "",
    dropoff_time: "",
    payment_method: "PayPal" as PaymentMethod,
    notes: "",
  });

  const days =
    form.pickup_time && form.dropoff_time
      ? calculateDays(form.pickup_time, form.dropoff_time)
      : 0;
  const estimatedTotal = days * pricePerDay;

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, car_id: carId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit booking");
      }

      toast.success("Booking request submitted! We'll be in touch soon.");
      router.push(`/cars/${carId}/book/success?id=${data.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      {/* Personal Info */}
      <fieldset>
        <legend className="text-sm font-semibold text-slate-900 mb-4">
          Your Information
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="first_name" className="label">
              First name *
            </label>
            <input
              id="first_name"
              required
              className="input-field"
              value={form.first_name}
              onChange={(e) => update("first_name", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="last_name" className="label">
              Last name *
            </label>
            <input
              id="last_name"
              required
              className="input-field"
              value={form.last_name}
              onChange={(e) => update("last_name", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="email" className="label">
              Email *
            </label>
            <input
              id="email"
              type="email"
              required
              className="input-field"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="phone" className="label">
              Phone *
            </label>
            <input
              id="phone"
              type="tel"
              required
              className="input-field"
              placeholder="(555) 123-4567"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </div>
        </div>
      </fieldset>

      {/* Addresses */}
      <fieldset>
        <legend className="text-sm font-semibold text-slate-900 mb-4">
          Pickup & Drop-off
        </legend>
        <div className="space-y-4">
          <div>
            <label htmlFor="pickup_address" className="label">
              Pickup address *
            </label>
            <input
              id="pickup_address"
              required
              className="input-field"
              placeholder="Street address, city, state"
              value={form.pickup_address}
              onChange={(e) => update("pickup_address", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="dropoff_address" className="label">
              Drop-off address *
            </label>
            <input
              id="dropoff_address"
              required
              className="input-field"
              placeholder="Street address, city, state"
              value={form.dropoff_address}
              onChange={(e) => update("dropoff_address", e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="pickup_time" className="label">
                Pickup date & time *
              </label>
              <input
                id="pickup_time"
                type="datetime-local"
                required
                className="input-field"
                value={form.pickup_time}
                onChange={(e) => update("pickup_time", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="dropoff_time" className="label">
                Drop-off date & time *
              </label>
              <input
                id="dropoff_time"
                type="datetime-local"
                required
                className="input-field"
                value={form.dropoff_time}
                onChange={(e) => update("dropoff_time", e.target.value)}
              />
            </div>
          </div>
        </div>
      </fieldset>

      {/* ID Verification Placeholder */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex gap-3">
          <FileCheck className="h-5 w-5 flex-shrink-0 text-amber-600 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-900">
              Driver&apos;s License / ID Verification
            </p>
            <p className="mt-1 text-xs leading-relaxed text-amber-800">
              A valid driver&apos;s license is required. After your booking is
              approved, you will complete identity verification through a
              compliant third-party provider (e.g. Stripe Identity, Persona, or
              Jumio). We do <strong>not</strong> store ID documents in our
              database. This is a placeholder for that secure workflow.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Preference */}
      <fieldset>
        <legend className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Preferred Payment Method *
        </legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PAYMENT_METHODS.map((method) => (
            <label
              key={method}
              className={`flex cursor-pointer items-center justify-center rounded-xl border-2 px-3 py-3 text-sm font-medium transition ${
                form.payment_method === method
                  ? "border-loco-500 bg-loco-50 text-loco-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                name="payment_method"
                value={method}
                checked={form.payment_method === method}
                onChange={() => update("payment_method", method)}
                className="sr-only"
              />
              {method}
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Your preference is stored for the owner. Actual payment is arranged
          after booking approval — no charges are processed here.
        </p>
      </fieldset>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="label">
          Additional notes
        </label>
        <textarea
          id="notes"
          rows={3}
          className="input-field resize-none"
          placeholder="Any special requests or information..."
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
        />
      </div>

      {/* Estimate */}
      {days > 0 && (
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">
              Estimated total ({days} day{days !== 1 ? "s" : ""})
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Final amount confirmed after approval
            </p>
          </div>
          <p className="font-display text-2xl font-bold text-slate-900">
            {formatCurrency(estimatedTotal)}
          </p>
        </div>
      )}

      {/* Security note */}
      <div className="flex items-start gap-2 text-xs text-slate-400">
        <Shield className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <p>
          Your information is protected. Only the vehicle owner can view booking
          details. We never share your data publicly.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full justify-center py-3.5 text-base"
      >
        {loading ? "Submitting..." : "Submit Booking Request"}
      </button>
    </form>
  );
}

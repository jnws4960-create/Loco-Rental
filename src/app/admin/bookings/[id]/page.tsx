import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatCurrency, STATUS_COLORS, calculateDays } from "@/lib/utils";
import type { Booking, Car } from "@/types";
import { ArrowLeft, User, MapPin, Calendar, CreditCard, FileText } from "lucide-react";
import BookingStatusActions from "@/components/admin/BookingStatusActions";

export const dynamic = "force-dynamic";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: booking, error } = await supabase
    .from("bookings")
    .select("*, car:cars(*)")
    .eq("id", id)
    .single();

  if (error || !booking) notFound();

  const b = booking as Booking & { car: Car | null };
  const days = calculateDays(b.pickup_time, b.dropoff_time);
  const estimated = b.car ? days * b.car.price_per_day : 0;

  return (
    <div>
      <Link
        href="/admin/bookings"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to bookings
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Booking Details
          </h1>
          <p className="mt-1 text-xs text-slate-400">ID: {b.id}</p>
        </div>
        <span
          className={`inline-flex rounded-full border px-3 py-1 text-sm font-medium capitalize ${STATUS_COLORS[b.status]}`}
        >
          {b.status}
        </span>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Customer */}
          <div className="card p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <User className="h-4 w-4 text-loco-500" />
              Customer Information
            </h2>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
              <div>
                <dt className="text-slate-400">Name</dt>
                <dd className="font-medium text-slate-900">
                  {b.first_name} {b.last_name}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Email</dt>
                <dd className="font-medium text-slate-900">
                  <a href={`mailto:${b.email}`} className="text-loco-600 hover:underline">
                    {b.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Phone</dt>
                <dd className="font-medium text-slate-900">
                  <a href={`tel:${b.phone}`} className="text-loco-600 hover:underline">
                    {b.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">ID Verification</dt>
                <dd className="font-medium text-slate-900 capitalize">
                  {b.id_verification_status.replace("_", " ")}
                </dd>
              </div>
            </dl>
          </div>

          {/* Locations & Dates */}
          <div className="card p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <MapPin className="h-4 w-4 text-loco-500" />
              Trip Details
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-slate-400">Pickup address</dt>
                <dd className="font-medium text-slate-900">{b.pickup_address}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Drop-off address</dt>
                <dd className="font-medium text-slate-900">{b.dropoff_address}</dd>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-slate-400 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> Pickup
                  </dt>
                  <dd className="font-medium text-slate-900">
                    {formatDate(b.pickup_time)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> Drop-off
                  </dt>
                  <dd className="font-medium text-slate-900">
                    {formatDate(b.dropoff_time)}
                  </dd>
                </div>
              </div>
            </dl>
          </div>

          {/* Notes */}
          {b.notes && (
            <div className="card p-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <FileText className="h-4 w-4 text-loco-500" />
                Notes
              </h2>
              <p className="mt-3 text-sm text-slate-600 whitespace-pre-wrap">
                {b.notes}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-slate-900">Vehicle</h2>
            <p className="mt-2 font-medium text-slate-900">
              {b.car?.name ?? "Unknown"}
            </p>
            {b.car && (
              <p className="mt-1 text-sm text-slate-500">
                {formatCurrency(b.car.price_per_day)}/day × {days} day
                {days !== 1 ? "s" : ""}
              </p>
            )}
            <p className="mt-3 font-display text-2xl font-bold text-slate-900">
              {formatCurrency(estimated)}
            </p>
            <p className="text-xs text-slate-400">Estimated total</p>
          </div>

          <div className="card p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <CreditCard className="h-4 w-4 text-loco-500" />
              Payment Preference
            </h2>
            <p className="mt-2 text-lg font-medium text-slate-900">
              {b.payment_method}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Preferred method — arrange payment after approval
            </p>
          </div>

          <div className="card p-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">
              Update Status
            </h2>
            <BookingStatusActions bookingId={b.id} currentStatus={b.status} />
          </div>

          <div className="text-xs text-slate-400 space-y-1">
            <p>Created: {formatDate(b.created_at)}</p>
            <p>Updated: {formatDate(b.updated_at)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate, STATUS_COLORS } from "@/lib/utils";
import type { Booking } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("bookings")
    .select("*, car:cars(name)")
    .order("created_at", { ascending: false });

  if (status && ["pending", "approved", "rejected", "cancelled"].includes(status)) {
    query = query.eq("status", status);
  }

  const { data: bookings } = await query;

  const filters = [
    { label: "All", value: "" },
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
    { label: "Cancelled", value: "cancelled" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900">
        Bookings
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        {bookings?.length ?? 0} booking{(bookings?.length ?? 0) !== 1 ? "s" : ""}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {filters.map((f) => (
          <Link
            key={f.value}
            href={f.value ? `/admin/bookings?status=${f.value}` : "/admin/bookings"}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
              (status || "") === f.value
                ? "bg-loco-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="mt-6 card overflow-hidden">
        {!bookings || bookings.length === 0 ? (
          <p className="p-12 text-center text-sm text-slate-400">
            No bookings found
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Vehicle</th>
                  <th className="px-4 py-3 font-medium">Pickup</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(bookings as (Booking & { car: { name: string } | null })[]).map(
                  (b) => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">
                          {b.first_name} {b.last_name}
                        </p>
                        <p className="text-xs text-slate-400">{b.email}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {b.car?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {formatDate(b.pickup_time)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {b.payment_method}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[b.status]}`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/bookings/${b.id}`}
                          className="text-sm font-medium text-loco-600 hover:text-loco-700"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

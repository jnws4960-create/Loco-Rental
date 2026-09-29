import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Car, CalendarDays, Clock, CheckCircle } from "lucide-react";
import { formatDate, STATUS_COLORS, formatCurrency } from "@/lib/utils";
import type { Booking, Car as CarType } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: carCount },
    { count: activeCarCount },
    { count: pendingCount },
    { data: recentBookings },
  ] = await Promise.all([
    supabase.from("cars").select("*", { count: "exact", head: true }),
    supabase
      .from("cars")
      .select("*", { count: "exact", head: true })
      .eq("active", true),
    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("bookings")
      .select("*, car:cars(name, price_per_day)")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const stats = [
    {
      label: "Total Vehicles",
      value: carCount ?? 0,
      icon: Car,
      href: "/admin/cars",
      color: "text-loco-600 bg-loco-50",
    },
    {
      label: "Active Listings",
      value: activeCarCount ?? 0,
      icon: CheckCircle,
      href: "/admin/cars",
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Pending Bookings",
      value: pendingCount ?? 0,
      icon: Clock,
      href: "/admin/bookings?status=pending",
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: "All Bookings",
      value: "View",
      icon: CalendarDays,
      href: "/admin/bookings",
      color: "text-violet-600 bg-violet-50",
    },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Manage your fleet and bookings
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="card p-5 transition hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}
              >
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {stat.value}
                </p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-slate-900">
            Recent Bookings
          </h2>
          <Link
            href="/admin/bookings"
            className="text-sm font-medium text-loco-600 hover:text-loco-700"
          >
            View all →
          </Link>
        </div>

        <div className="mt-4 card overflow-hidden">
          {!recentBookings || recentBookings.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-400">
              No bookings yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Vehicle</th>
                    <th className="px-4 py-3 font-medium">Dates</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(recentBookings as (Booking & { car: { name: string; price_per_day: number } | null })[]).map(
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
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { BookingStatus } from "@/types";

const actions: { status: BookingStatus; label: string; className: string }[] = [
  {
    status: "approved",
    label: "Approve",
    className: "bg-emerald-600 hover:bg-emerald-700 text-white",
  },
  {
    status: "rejected",
    label: "Reject",
    className: "bg-red-600 hover:bg-red-700 text-white",
  },
  {
    status: "cancelled",
    label: "Cancel",
    className: "bg-slate-600 hover:bg-slate-700 text-white",
  },
  {
    status: "pending",
    label: "Reset to Pending",
    className: "bg-amber-500 hover:bg-amber-600 text-white",
  },
];

export default function BookingStatusActions({
  bookingId,
  currentStatus,
}: {
  bookingId: string;
  currentStatus: BookingStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus(status: BookingStatus) {
    if (status === currentStatus) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed");
      }
      toast.success(`Booking ${status}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {actions
        .filter((a) => a.status !== currentStatus)
        .map((a) => (
          <button
            key={a.status}
            type="button"
            disabled={loading}
            onClick={() => updateStatus(a.status)}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${a.className}`}
          >
            {a.label}
          </button>
        ))}
    </div>
  );
}

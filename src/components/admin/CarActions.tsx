"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import type { Car } from "@/types";
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";

export default function CarActions({ car }: { car: Car }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggleActive() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/cars/${car.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !car.active }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(car.active ? "Vehicle hidden" : "Vehicle published");
      router.refresh();
    } catch {
      toast.error("Failed to update");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${car.name}"? This cannot be undone.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/cars/${car.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed");
      }
      toast.success("Vehicle deleted");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/admin/cars/${car.id}`}
        className="btn-ghost text-sm"
        title="Edit"
      >
        <Pencil className="h-4 w-4" />
        <span className="hidden sm:inline">Edit</span>
      </Link>
      <button
        type="button"
        onClick={toggleActive}
        disabled={loading}
        className="btn-ghost text-sm"
        title={car.active ? "Hide" : "Show"}
      >
        {car.active ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">
          {car.active ? "Hide" : "Show"}
        </span>
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="btn-ghost text-sm text-red-600 hover:bg-red-50"
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

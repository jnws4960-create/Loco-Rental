import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import type { Car } from "@/types";
import { Plus, Car as CarIcon, Eye, EyeOff } from "lucide-react";
import CarActions from "@/components/admin/CarActions";

export const dynamic = "force-dynamic";

export default async function AdminCarsPage() {
  const supabase = await createClient();
  const { data: cars } = await supabase
    .from("cars")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Vehicles
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {cars?.length ?? 0} vehicle{(cars?.length ?? 0) !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/admin/cars/new" className="btn-primary">
          <Plus className="h-4 w-4" />
          Add Vehicle
        </Link>
      </div>

      <div className="mt-8 space-y-4">
        {!cars || cars.length === 0 ? (
          <div className="card py-16 text-center">
            <CarIcon className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-4 text-slate-500">No vehicles yet</p>
            <Link href="/admin/cars/new" className="btn-primary mt-4 inline-flex">
              Add your first vehicle
            </Link>
          </div>
        ) : (
          (cars as Car[]).map((car) => (
            <div
              key={car.id}
              className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
            >
              <div className="relative h-24 w-full flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-20 sm:w-32">
                {car.images?.[0] ? (
                  <Image
                    src={car.images[0]}
                    alt={car.name}
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <CarIcon className="h-8 w-8 text-slate-300" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900 truncate">
                    {car.name}
                  </h3>
                  {car.active ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      <Eye className="h-3 w-3" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                      <EyeOff className="h-3 w-3" /> Hidden
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-slate-500 line-clamp-1">
                  {car.description}
                </p>
                <p className="mt-1 text-sm font-semibold text-loco-600">
                  {formatCurrency(car.price_per_day)}/day
                </p>
              </div>

              <CarActions car={car} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

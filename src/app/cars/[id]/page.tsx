import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import type { Car } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, Calendar, MapPin, Shield } from "lucide-react";
import CarGallery from "@/components/cars/CarGallery";

export const revalidate = 30;

async function getCar(id: string): Promise<Car | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cars")
    .select("*")
    .eq("id", id)
    .eq("active", true)
    .single();

  if (error || !data) return null;
  return data;
}

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const car = await getCar(id);

  if (!car) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/cars"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to cars
          </Link>

          <div className="grid gap-10 lg:grid-cols-2">
            {/* Gallery */}
            <CarGallery images={car.images} name={car.name} />

            {/* Details */}
            <div>
              <h1 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">
                {car.name}
              </h1>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-3xl font-bold text-loco-600">
                  {formatCurrency(car.price_per_day)}
                </span>
                <span className="text-slate-500">/ day</span>
              </div>

              <p className="mt-6 text-base leading-relaxed text-slate-600">
                {car.description}
              </p>

              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Calendar className="h-5 w-5 text-loco-500" />
                  Flexible pickup & drop-off times
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <MapPin className="h-5 w-5 text-loco-500" />
                  Convenient local pickup locations
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Shield className="h-5 w-5 text-loco-500" />
                  Identity verification required
                </div>
              </div>

              <div className="mt-10">
                <Link
                  href={`/cars/${car.id}/book`}
                  className="btn-primary w-full justify-center text-base py-3.5 sm:w-auto sm:px-10"
                >
                  Request this car
                </Link>
              </div>

              <p className="mt-4 text-xs text-slate-400">
                Booking is subject to owner approval. Payment preference is
                stored; actual payment is arranged after approval.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

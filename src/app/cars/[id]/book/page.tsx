import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BookingForm from "@/components/cars/BookingForm";
import type { Car } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

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

export default async function BookCarPage({
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
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href={`/cars/${car.id}`}
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {car.name}
          </Link>

          <div className="card p-6 sm:p-8">
            <div className="border-b border-slate-100 pb-6">
              <h1 className="font-display text-2xl font-bold text-slate-900">
                Request Booking
              </h1>
              <p className="mt-1 text-slate-500">
                {car.name} · {formatCurrency(car.price_per_day)}/day
              </p>
            </div>

            <BookingForm carId={car.id} pricePerDay={car.price_per_day} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CarCard from "@/components/cars/CarCard";
import type { Car } from "@/types";

export const revalidate = 30;

async function getCars(): Promise<Car[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cars")
    .select("*")
    .eq("active", true)
    .order("price_per_day", { ascending: true });

  if (error) {
    console.error("Error fetching cars:", error.message);
    return [];
  }
  return data || [];
}

export default async function CarsPage() {
  const cars = await getCars();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <h1 className="section-heading">Browse Cars</h1>
            <p className="mt-2 text-slate-500">
              {cars.length} vehicle{cars.length !== 1 ? "s" : ""} available
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {cars.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-20 text-center">
              <p className="text-lg text-slate-500">No cars available right now.</p>
              <p className="mt-2 text-sm text-slate-400">
                Please check back later or contact us for availability.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {cars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CarCard from "@/components/cars/CarCard";
import type { Car } from "@/types";
import {
  Search,
  CalendarCheck,
  Key,
  Shield,
  Star,
  ArrowRight,
} from "lucide-react";

export const revalidate = 60;

async function getFeaturedCars(): Promise<Car[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cars")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) {
    console.error("Error fetching cars:", error.message);
    return [];
  }
  return data || [];
}

export default async function HomePage() {
  const cars = await getFeaturedCars();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-loco-950 to-slate-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-loco-400">
              Premium Car Rentals
            </p>
            <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Drive something
              <span className="block text-loco-400">extraordinary</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-300">
              From Tesla to Porsche, rent exceptional cars from trusted local
              owners. Flexible booking, transparent pricing, and a seamless
              experience.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/cars" className="btn-primary bg-loco-500 hover:bg-loco-400 text-base px-7 py-3">
                Browse Cars
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#how-it-works" className="btn-secondary border-slate-600 bg-transparent text-white hover:bg-white/10 text-base px-7 py-3">
                How it Works
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-slate-200 sm:grid-cols-4">
          {[
            { label: "Vehicles", value: "50+" },
            { label: "Happy Drivers", value: "1,200+" },
            { label: "Cities", value: "12" },
            { label: "Avg. Rating", value: "4.9★" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white px-6 py-8 text-center"
            >
              <p className="font-display text-3xl font-bold text-slate-900">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Cars */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="section-heading">Featured Vehicles</h2>
            <p className="mt-2 text-slate-500">
              Hand-picked cars ready for your next adventure
            </p>
          </div>
          <Link
            href="/cars"
            className="hidden text-sm font-semibold text-loco-600 hover:text-loco-700 sm:block"
          >
            View all →
          </Link>
        </div>

        {cars.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
            <p className="text-slate-500">
              No vehicles available yet. Check back soon!
            </p>
            <p className="mt-2 text-sm text-slate-400">
              (Make sure Supabase is configured and the schema is applied.)
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link href="/cars" className="btn-primary">
            View all cars
          </Link>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="bg-white border-y border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="section-heading">How it Works</h2>
            <p className="mt-2 text-slate-500">
              Three simple steps to your next drive
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Search,
                title: "1. Find your car",
                desc: "Browse our curated selection of premium vehicles. Filter by style, price, and availability.",
              },
              {
                icon: CalendarCheck,
                title: "2. Request a booking",
                desc: "Choose your dates, provide pickup details, and select your preferred payment method.",
              },
              {
                icon: Key,
                title: "3. Hit the road",
                desc: "Once approved, pick up the keys and enjoy the drive. Drop off when you're done.",
              },
            ].map((step) => (
              <div key={step.title} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-loco-50 text-loco-600">
                  <step.icon className="h-7 w-7" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="card p-8">
            <Shield className="h-10 w-10 text-loco-600" />
            <h3 className="mt-4 font-display text-xl font-semibold text-slate-900">
              Verified & Secure
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Every booking includes identity verification workflow and clear
              terms. Your safety and peace of mind come first.
            </p>
          </div>
          <div className="card p-8">
            <Star className="h-10 w-10 text-accent" />
            <h3 className="mt-4 font-display text-xl font-semibold text-slate-900">
              Premium Experience
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              From the moment you browse to the moment you return the keys, we
              focus on a smooth, professional rental experience.
            </p>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section id="contact" className="bg-loco-600">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
            Questions? We&apos;re here to help
          </h2>
          <p className="mt-3 text-loco-100">
            Reach us anytime at{" "}
            <a
              href="mailto:mattewgross85@gmail.com"
              className="underline hover:text-white"
            >
              mattewgross85@gmail.com
            </a>{" "}
            or call{" "}
            <a href="tel:+12016198112" className="underline hover:text-white">
              (201) 619-8112
            </a>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

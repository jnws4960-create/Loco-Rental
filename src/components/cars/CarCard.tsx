import Link from "next/link";
import Image from "next/image";
import { Car as CarIcon } from "lucide-react";
import type { Car } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface CarCardProps {
  car: Car;
}

export default function CarCard({ car }: CarCardProps) {
  const imageUrl = car.images?.[0] || null;

  return (
    <Link
      href={`/cars/${car.id}`}
      className="group card overflow-hidden transition hover:shadow-lg hover:-translate-y-0.5"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={car.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <CarIcon className="h-16 w-16 text-slate-300" />
          </div>
        )}
        <div className="absolute bottom-3 right-3 rounded-lg bg-white/95 px-3 py-1.5 text-sm font-bold text-slate-900 shadow-sm backdrop-blur">
          {formatCurrency(car.price_per_day)}
          <span className="font-normal text-slate-500">/day</span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg font-semibold text-slate-900 group-hover:text-loco-700 transition">
          {car.name}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-slate-500">
          {car.description}
        </p>
        <div className="mt-4 flex items-center text-sm font-medium text-loco-600">
          View details
          <svg
            className="ml-1 h-4 w-4 transition group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}

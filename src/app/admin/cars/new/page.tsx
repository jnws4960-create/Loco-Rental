import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CarForm from "@/components/admin/CarForm";

export default function NewCarPage() {
  return (
    <div>
      <Link
        href="/admin/cars"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to vehicles
      </Link>
      <h1 className="font-display text-2xl font-bold text-slate-900">
        Add Vehicle
      </h1>
      <div className="mt-6 card max-w-2xl p-6">
        <CarForm />
      </div>
    </div>
  );
}

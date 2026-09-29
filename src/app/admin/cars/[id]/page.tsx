import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft } from "lucide-react";
import CarForm from "@/components/admin/CarForm";
import type { Car } from "@/types";

export const dynamic = "force-dynamic";

export default async function EditCarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: car, error } = await supabase
    .from("cars")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !car) notFound();

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
        Edit Vehicle
      </h1>
      <div className="mt-6 card max-w-2xl p-6">
        <CarForm car={car as Car} />
      </div>
    </div>
  );
}

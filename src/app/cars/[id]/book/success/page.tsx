import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CheckCircle } from "lucide-react";

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="card max-w-md w-full p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="mt-6 font-display text-2xl font-bold text-slate-900">
            Request Submitted!
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            Your booking request has been sent to the owner. You&apos;ll receive
            an email once it&apos;s reviewed. Please keep an eye on your inbox.
          </p>
          {id && (
            <p className="mt-4 text-xs text-slate-400">
              Reference: {id.slice(0, 8).toUpperCase()}
            </p>
          )}
          <div className="mt-8 flex flex-col gap-3">
            <Link href="/cars" className="btn-primary justify-center">
              Browse more cars
            </Link>
            <Link href="/" className="btn-secondary justify-center">
              Back to home
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

import Link from "next/link";
import { Car, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-loco-500 text-white">
                <Car className="h-5 w-5" />
              </div>
              <span className="font-display text-xl font-bold text-white">
                LOCO<span className="text-loco-400">.com</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              Premium peer-to-peer car rentals. Drive exceptional vehicles from
              trusted local owners.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Contact
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-loco-400" />
                <a
                  href="mailto:mattewgross85@gmail.com"
                  className="hover:text-white transition"
                >
                  mattewgross85@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-loco-400" />
                <a
                  href="mailto:alexander22gate@gmail.com"
                  className="hover:text-white transition"
                >
                  alexander22gate@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-loco-400" />
                <a href="tel:+12016198112" className="hover:text-white transition">
                  (201) 619-8112
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-loco-400" />
                <a href="tel:+13036160578" className="hover:text-white transition">
                  (303) 616-0578
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/cars" className="hover:text-white transition">
                  Browse Cars
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-white transition">
                  How it Works
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition">
                  Owner Login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} LOCO.com. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

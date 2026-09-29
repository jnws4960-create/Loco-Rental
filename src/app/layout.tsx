import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "LOCO.com – Premium Car Rentals",
  description:
    "Rent exceptional cars from trusted owners. Tesla, Porsche, BMW, Mercedes and more. Book your next drive on LOCO.com.",
  keywords: ["car rental", "luxury cars", "peer to peer rental", "LOCO"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="min-h-screen font-sans">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: "12px",
              background: "#0f172a",
              color: "#f8fafc",
            },
          }}
        />
      </body>
    </html>
  );
}

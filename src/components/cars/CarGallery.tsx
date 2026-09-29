"use client";

import { useState } from "react";
import Image from "next/image";
import { Car as CarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CarGalleryProps {
  images: string[];
  name: string;
}

export default function CarGallery({ images, name }: CarGalleryProps) {
  const [active, setActive] = useState(0);
  const hasImages = images && images.length > 0;

  if (!hasImages) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-slate-100">
        <CarIcon className="h-24 w-24 text-slate-300" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
        <Image
          src={images[active]}
          alt={`${name} – photo ${active + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 transition",
                i === active
                  ? "border-loco-500"
                  : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              <Image
                src={img}
                alt={`Thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="96px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

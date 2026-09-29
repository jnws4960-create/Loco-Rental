"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import type { Car } from "@/types";
import { Upload, X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface CarFormProps {
  car?: Car;
}

export default function CarForm({ car }: CarFormProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: car?.name || "",
    description: car?.description || "",
    price_per_day: car?.price_per_day?.toString() || "",
    active: car?.active ?? true,
  });
  const [images, setImages] = useState<string[]>(car?.images || []);

  function update(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const supabase = createClient();
    const newUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image`);
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 5MB)`);
          continue;
        }

        const ext = file.name.split(".").pop();
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("car-images")
          .upload(path, file, { cacheControl: "3600", upsert: false });

        if (uploadError) {
          // Fallback: if storage not set up, use a data URL for demo
          if (uploadError.message.includes("Bucket") || uploadError.message.includes("not found")) {
            toast.error(
              "Storage bucket not configured. See README for setup. Using placeholder for now."
            );
            // Use object URL as temporary local preview only — won't persist
            const localUrl = URL.createObjectURL(file);
            newUrls.push(localUrl);
            continue;
          }
          throw uploadError;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("car-images").getPublicUrl(path);
        newUrls.push(publicUrl);
      }

      setImages((prev) => [...prev, ...newUrls]);
      if (newUrls.length > 0) toast.success(`${newUrls.length} image(s) added`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload image(s)");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price_per_day: parseFloat(form.price_per_day),
      images,
      active: form.active,
    };

    if (!payload.name || isNaN(payload.price_per_day) || payload.price_per_day < 0) {
      toast.error("Please fill in name and a valid price");
      setLoading(false);
      return;
    }

    try {
      const url = car ? `/api/admin/cars/${car.id}` : "/api/admin/cars";
      const method = car ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");

      toast.success(car ? "Vehicle updated" : "Vehicle created");
      router.push("/admin/cars");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="label">
          Vehicle name *
        </label>
        <input
          id="name"
          required
          className="input-field"
          placeholder="e.g. Tesla Model 3 Performance"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="description" className="label">
          Description *
        </label>
        <textarea
          id="description"
          required
          rows={4}
          className="input-field resize-none"
          placeholder="Describe the vehicle, features, and what makes it special..."
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="price" className="label">
          Price per day (USD) *
        </label>
        <input
          id="price"
          type="number"
          required
          min="0"
          step="0.01"
          className="input-field"
          placeholder="149"
          value={form.price_per_day}
          onChange={(e) => update("price_per_day", e.target.value)}
        />
      </div>

      {/* Images */}
      <div>
        <label className="label">Photos</label>
        <div className="flex flex-wrap gap-3">
          {images.map((url, i) => (
            <div
              key={i}
              className="relative h-24 w-32 overflow-hidden rounded-xl border border-slate-200"
            >
              <Image
                src={url}
                alt={`Photo ${i + 1}`}
                fill
                className="object-cover"
                sizes="128px"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-white shadow"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex h-24 w-32 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 text-slate-400 transition hover:border-loco-400 hover:text-loco-500"
          >
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Upload className="h-5 w-5" />
                <span className="text-xs">Upload</span>
              </>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Upload to Supabase Storage (car-images bucket). Max 5MB per image.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <input
          id="active"
          type="checkbox"
          checked={form.active}
          onChange={(e) => update("active", e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-loco-600 focus:ring-loco-500"
        />
        <label htmlFor="active" className="text-sm text-slate-700">
          Active (visible to customers)
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
        >
          {loading ? "Saving..." : car ? "Save Changes" : "Create Vehicle"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

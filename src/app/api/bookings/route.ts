import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const bookingSchema = z.object({
  car_id: z.string().uuid(),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().min(7).max(30),
  pickup_address: z.string().min(5).max(500),
  dropoff_address: z.string().min(5).max(500),
  pickup_time: z.string().datetime({ offset: true }).or(z.string().min(1)),
  dropoff_time: z.string().datetime({ offset: true }).or(z.string().min(1)),
  payment_method: z.enum(["PayPal", "Cash App", "Zelle", "Chime"]),
  notes: z.string().max(2000).optional().default(""),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = bookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid form data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const pickup = new Date(data.pickup_time);
    const dropoff = new Date(data.dropoff_time);

    if (isNaN(pickup.getTime()) || isNaN(dropoff.getTime())) {
      return NextResponse.json(
        { error: "Invalid date/time format" },
        { status: 400 }
      );
    }

    if (dropoff <= pickup) {
      return NextResponse.json(
        { error: "Drop-off must be after pickup" },
        { status: 400 }
      );
    }

    if (pickup < new Date()) {
      return NextResponse.json(
        { error: "Pickup time must be in the future" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify car exists and is active
    const { data: car, error: carError } = await supabase
      .from("cars")
      .select("id, active")
      .eq("id", data.car_id)
      .single();

    if (carError || !car || !car.active) {
      return NextResponse.json(
        { error: "Car not found or unavailable" },
        { status: 404 }
      );
    }

    // Check for overlapping bookings (server-side + DB constraint as backup)
    const { data: overlapping, error: overlapError } = await supabase
      .from("bookings")
      .select("id")
      .eq("car_id", data.car_id)
      .in("status", ["pending", "approved"])
      .lt("pickup_time", dropoff.toISOString())
      .gt("dropoff_time", pickup.toISOString())
      .limit(1);

    if (overlapError) {
      console.error("Overlap check error:", overlapError);
    }

    if (overlapping && overlapping.length > 0) {
      return NextResponse.json(
        {
          error:
            "This vehicle is already booked for the selected dates. Please choose different dates.",
        },
        { status: 409 }
      );
    }

    // Insert booking
    const { data: booking, error: insertError } = await supabase
      .from("bookings")
      .insert({
        car_id: data.car_id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        pickup_address: data.pickup_address,
        dropoff_address: data.dropoff_address,
        pickup_time: pickup.toISOString(),
        dropoff_time: dropoff.toISOString(),
        payment_method: data.payment_method,
        notes: data.notes || "",
        status: "pending",
        id_verification_status: "pending",
      })
      .select("id")
      .single();

    if (insertError) {
      // Catch exclusion constraint violation
      if (insertError.code === "23P01" || insertError.message?.includes("overlap")) {
        return NextResponse.json(
          {
            error:
              "This vehicle is already booked for the selected dates. Please choose different dates.",
          },
          { status: 409 }
        );
      }
      console.error("Insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to create booking. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: booking.id, success: true });
  } catch (err) {
    console.error("Booking API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

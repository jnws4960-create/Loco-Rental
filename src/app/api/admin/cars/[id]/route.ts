import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized", status: 401, supabase: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return { error: "Forbidden", status: 403, supabase: null };
  }

  return { error: null, status: 200, supabase };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth.error || !auth.supabase) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (body.name !== undefined) updates.name = body.name;
    if (body.description !== undefined) updates.description = body.description;
    if (body.price_per_day !== undefined)
      updates.price_per_day = Number(body.price_per_day);
    if (body.images !== undefined) updates.images = body.images;
    if (body.active !== undefined) updates.active = body.active;

    const { data, error } = await auth.supabase
      .from("cars")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth.error || !auth.supabase) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;

  // Check for existing non-cancelled bookings
  const { data: bookings } = await auth.supabase
    .from("bookings")
    .select("id")
    .eq("car_id", id)
    .in("status", ["pending", "approved"])
    .limit(1);

  if (bookings && bookings.length > 0) {
    return NextResponse.json(
      {
        error:
          "Cannot delete vehicle with active or pending bookings. Hide it instead, or cancel the bookings first.",
      },
      { status: 409 }
    );
  }

  const { error } = await auth.supabase.from("cars").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

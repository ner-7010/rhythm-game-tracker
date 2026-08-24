import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from("games").select("*").order("created_at", { ascending: true });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ games: data || [] });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { games } = body;
    if (!games || !Array.isArray(games)) {
      return NextResponse.json({ error: "Invalid games array" }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from("games").upsert(games, { onConflict: "id" });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, count: games.length });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing game id" }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase.from("games").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal server error" }, { status: 500 });
  }
}


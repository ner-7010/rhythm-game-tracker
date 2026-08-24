import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("gameId");

    const supabase = getSupabaseClient();
    let query = supabase.from("play_records").select("*");
    if (gameId) {
      query = query.eq("game_id", gameId);
    }
    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ records: data || [] });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mode, gameId, records, record } = body;

    const supabase = getSupabaseClient();

    if (mode === "replace") {
      if (!gameId) {
        return NextResponse.json({ error: "Missing gameId for replace mode" }, { status: 400 });
      }

      // 1. Delete old records
      await supabase.from("play_records").delete().eq("game_id", gameId);

      // 2. Insert new records in chunks
      const insertRecords = (records || []).map((r: any) => {
        const row = { ...r };
        delete row.id;
        return row;
      });

      const chunkSize = 200;
      for (let i = 0; i < insertRecords.length; i += chunkSize) {
        const chunk = insertRecords.slice(i, i + chunkSize);
        const { error } = await supabase.from("play_records").insert(chunk);
        if (error) throw error;
      }

      return NextResponse.json({ success: true, count: insertRecords.length });
    } else if (mode === "upsertSingle") {
      if (!record) {
        return NextResponse.json({ error: "Missing record to upsert" }, { status: 400 });
      }
      const { data, error } = await supabase.from("play_records").upsert(record);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing record id" }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase.from("play_records").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal server error" }, { status: 500 });
  }
}


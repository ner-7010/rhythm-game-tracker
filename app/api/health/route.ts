import { NextResponse } from "next/server";
import { getSupabaseClient, rawUrl, rawKey, isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      status: "warning",
      message: "Environment variables (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY) are missing or set to placeholder",
      hasUrl: !!rawUrl,
      hasKey: !!rawKey,
    }, { status: 200 });
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from("games").select("id, name").limit(5);

    if (error) {
      return NextResponse.json({
        status: "error",
        message: error.message,
        details: error,
      }, { status: 500 });
    }

    return NextResponse.json({
      status: "ok",
      gamesCount: data?.length || 0,
      games: data,
    });
  } catch (e: any) {
    return NextResponse.json({
      status: "error",
      message: e?.message || String(e),
    }, { status: 500 });
  }
}


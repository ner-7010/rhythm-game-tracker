import { NextResponse } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";

  if (!url || !key) {
    return NextResponse.json({
      status: "error",
      message: "Environment variables (SUPABASE_URL / SUPABASE_ANON_KEY) are missing on server",
      hasUrl: !!url,
      hasKey: !!key,
    }, { status: 500 });
  }

  try {
    const supabase = createClient(url, key);
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
      supabaseUrl: url.replace(/:[^@]+@/, ":***@"),
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


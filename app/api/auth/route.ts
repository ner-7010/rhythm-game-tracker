import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
  if (!url || !key) {
    throw new Error("Supabase URLまたはAPIキーが設定されていません。VercelのEnvironment Variablesをご確認ください。");
  }
  return createClient(url, key);
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, action } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "メールアドレスとパスワードを入力してください" }, { status: 400 });
    }

    const supabase = getSupabase();

    if (action === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({
        user: data.user ? { id: data.user.id, email: data.user.email } : null,
        session: data.session,
        message: data.session ? "登録完了" : "確認メールを送信しました",
      });
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        const msg = error.message === "Invalid login credentials"
          ? "メールアドレスまたはパスワードが正しくありません"
          : error.message;
        return NextResponse.json({ error: msg }, { status: 400 });
      }

      return NextResponse.json({
        user: data.user ? { id: data.user.id, email: data.user.email } : null,
        session: data.session,
      });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "認証サーバーエラーが発生しました" }, { status: 500 });
  }
}


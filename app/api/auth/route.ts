import { NextResponse } from "next/server";
import { cleanSupabaseUrl, cleanSupabaseKey } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, action } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "メールアドレスとパスワードを入力してください" }, { status: 400 });
    }

    const url = cleanSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL);
    const key = cleanSupabaseKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY);

    if (action === "signup") {
      const res = await fetch(`${url}/auth/v1/signup`, {
        method: "POST",
        headers: {
          apikey: key,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return NextResponse.json({ error: data.msg || data.error_description || data.message || "登録に失敗しました" }, { status: res.status });
      }

      return NextResponse.json({
        user: data.user ? { id: data.user.id, email: data.user.email } : (data.id ? { id: data.id, email: data.email } : null),
        session: data.session || (data.access_token ? data : null),
        message: data.access_token ? "登録完了" : "確認メールを送信しました",
      });
    } else {
      const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: {
          apikey: key,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        let msg = data.msg || data.error_description || data.message || "ログインに失敗しました";
        if (data.error_code === "invalid_credentials" || msg === "Invalid login credentials") {
          msg = "メールアドレスまたはパスワードが正しくありません";
        }
        return NextResponse.json({ error: msg }, { status: res.status });
      }

      return NextResponse.json({
        user: data.user ? { id: data.user.id, email: data.user.email } : null,
        session: data,
      });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "認証サーバーエラーが発生しました" }, { status: 500 });
  }
}


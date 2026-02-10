import { NextResponse } from "next/server";

const WISDOM_URL = process.env.WISDOM_URL!;
const WISDOM_API_KEY = process.env.WISDOM_API_KEY!;

export async function POST(req: Request) {
  try {
    const { scope, file, language, code, range } = await req.json();

    if (!file || !code) {
      return NextResponse.json(
        { error: "Missing file or code" },
        { status: 400 }
      );
    }

    // 🔥 CALL WISDOM AI ENGINE
    const wisdomRes = await fetch(WISDOM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": WISDOM_API_KEY,
      },
      body: JSON.stringify({
        file,
        language: language || "python",
        code,
        scope: scope || "file",
        policy: { org: "devsync" },
      }),
    });

    const data = await wisdomRes.json();

    // if WISDOM policy failed
    if (!wisdomRes.ok) {
      return NextResponse.json(
        {
          error: "WISDOM policy failed",
          wisdom: data,
        },
        { status: wisdomRes.status }
      );
    }

    // Map to DevSync format
    const results = (data.issues || []).map((i: any, index: number) => ({
      id: String(index),
      severity: i.severity || "info",
      category: i.category || "style",
      message: i.message,
      confidence: i.confidence || "medium",
    }));

    return NextResponse.json({
      success: true,
      engine: "WISDOM AI",
      summary: data.summary,
      policy: data.policy,
      results,
    });
  } catch (err) {
    console.error("WISDOM CONNECT ERROR:", err);
    return NextResponse.json(
      { error: "WISDOM connection failed" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";

const WISDOM_BASE = "https://wisdom-ai-fn24.onrender.com";
const WISDOM_REVIEW = `${WISDOM_BASE}/review`;
const WISDOM_HEALTH = `${WISDOM_BASE}/health`;
const WISDOM_KEY = "devsync_live_abc123";

async function wakeWisdom() {
  try {
    await fetch(WISDOM_HEALTH, { method: "GET" });
    // wait a bit if cold start
    await new Promise(r => setTimeout(r, 1200));
  } catch (e) {
    console.log("Wake attempt done");
  }
}

export async function POST(req: Request) {
  try {
    const { scope, file, language, code } = await req.json();

    if (!file || !code) {
      return NextResponse.json(
        { error: "Missing file or code" },
        { status: 400 }
      );
    }

    //  AUTO WAKE SERVER
    await wakeWisdom();

    // CALL WISDOM
    const wisdomRes = await fetch(WISDOM_REVIEW, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": WISDOM_KEY,
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

    if (!wisdomRes.ok) {
      return NextResponse.json(
        { error: "WISDOM policy failed", details: data },
        { status: wisdomRes.status }
      );
    }

    // map issues → DevSync panel
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

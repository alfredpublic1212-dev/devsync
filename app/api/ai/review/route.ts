import { NextResponse } from 'next/server';

const WISDOM_URL = "[https://wisdom-ai-fn24.onrender.com/review](https://wisdom-ai-fn24.onrender.com/review)";

export async function POST(req: Request) {
try {
const { scope, file, language, code, range } = await req.json();

```
if (!file || !code) {
  return NextResponse.json(
    { error: 'Missing file or code' },
    { status: 400 }
  );
}

// CALL WISDOM AI ENGINE
const wisdomRes = await fetch(WISDOM_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "devsync_live_abc123" // your org key
  },
  body: JSON.stringify({
    file,
    language: language || "python",
    code,
    scope: scope || "file"
  })
});

const wisdomData = await wisdomRes.json();

if (!wisdomRes.ok) {
  return NextResponse.json({
    error: "WISDOM policy failed",
    wisdom: wisdomData
  }, { status: wisdomRes.status });
}

// MAP wisdom issues → devsync format
const results = (wisdomData.issues || []).map((i: any, index: number) => ({
  id: String(index),
  severity: i.severity || "info",
  category: i.category || "style",
  message: i.message,
  confidence: i.confidence || "medium"
}));

return NextResponse.json({
  success: true,
  engine: "WISDOM AI",
  results
});
```

} catch (err) {
console.error("WISDOM CONNECT ERROR:", err);
return NextResponse.json(
{ error: 'WISDOM connection failed' },
{ status: 500 }
);
}
}

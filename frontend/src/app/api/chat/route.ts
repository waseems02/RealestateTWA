import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  // Stub — Step 5 will wire up the real OpenAI agent + Supabase query
  return NextResponse.json({
    reply: `קיבלתי: "${message}". עוזר ה-AI עדיין בפיתוח — Step 5 יחבר אותו לנתוני הדירות האמיתיים. 🏗️`,
    listings: [],
  });
}

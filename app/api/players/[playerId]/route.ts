// app/api/players/[playerId]/route.ts
import { NextResponse } from "next/server";
import { getPlayerGameLog } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ playerId: string }> }
) {
  try {
    const { playerId } = await params;
    const stats = await getPlayerGameLog(playerId);

    return NextResponse.json(
      { success: true, count: stats.length, rows: stats },
      { status: 200 },
    );
  } catch (err: any) {
    console.error("API /api/players/[playerId] error:", err);
    return NextResponse.json(
      { success: false, message: err?.message ?? "Internal server error" },
      { status: 500 },
    );
  }
}


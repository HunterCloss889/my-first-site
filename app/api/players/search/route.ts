// app/api/players/search/route.ts
import { NextResponse } from "next/server";
import { searchPlayersByName } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryRaw = searchParams.get("q");

    const query = queryRaw ? queryRaw.trim() : "";

    if (!query || query.length < 2) {
      return NextResponse.json(
        { success: true, count: 0, players: [] },
        { status: 200 },
      );
    }

    const players = await searchPlayersByName(query);

    return NextResponse.json(
      { success: true, count: players.length, players },
      { status: 200 },
    );
  } catch (err: any) {
    console.error("API /api/players/search error:", err);
    return NextResponse.json(
      { success: false, message: err?.message ?? "Internal server error" },
      { status: 500 },
    );
  }
}


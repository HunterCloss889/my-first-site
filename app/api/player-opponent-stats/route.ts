// app/api/player-opponent-stats/route.ts
import { NextResponse } from "next/server";
import { getPlayerStatsAgainstOpponent } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const playerIdRaw = searchParams.get("playerId");
    const opponentTeamRaw = searchParams.get("opponentTeam");
    const seasonRaw = searchParams.get("season");

    const playerId = playerIdRaw ? playerIdRaw.trim() : "";
    const opponentTeam = opponentTeamRaw ? opponentTeamRaw.trim() : "";
    const season = seasonRaw ? Number(seasonRaw.trim()) : NaN;

    if (!playerId || !opponentTeam || Number.isNaN(season)) {
      return NextResponse.json(
        { success: false, message: "Missing playerId, opponentTeam, or season" },
        { status: 400 },
      );
    }

    const rows = await getPlayerStatsAgainstOpponent(playerId, opponentTeam, season);

    return NextResponse.json(
      { success: true, count: rows.length, rows },
      { status: 200 },
    );
  } catch (err: any) {
    console.error("API /api/player-opponent-stats error:", err);
    return NextResponse.json(
      { success: false, message: err?.message ?? "Internal server error" },
      { status: 500 },
    );
  }
}


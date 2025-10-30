// app/api/players/route.ts
import { NextResponse } from "next/server";
import {
  getStatsByTeamAndSeason,
  getStatsByTeam,
  getRecentStats,
} from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teamRaw = searchParams.get("team");
    const seasonRaw = searchParams.get("season");

    // normalize
    const team = teamRaw ? teamRaw.trim() : "";
    const season = seasonRaw ? Number(seasonRaw.trim()) : NaN;

    let rows;

    if (team && !Number.isNaN(season)) {
      // /api/players?team=BUF&season=2024
      rows = await getStatsByTeamAndSeason(team, season);
    } else if (team) {
      // /api/players?team=BUF
      rows = await getStatsByTeam(team);
    } else {
      // /api/players
      rows = await getRecentStats(100);
    }

    return NextResponse.json(
      {
        success: true,
        count: rows.length,
        rows,
      },
      { status: 200 },
    );
  } catch (err: any) {
    console.error("API /api/players error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err?.message ?? "Internal server error",
      },
      { status: 500 },
    );
  }
}

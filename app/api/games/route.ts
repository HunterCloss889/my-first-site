import { NextResponse } from "next/server";
import { getGamesBySeasonWeekOrdered, getGamesBySeasonOrdered } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const seasonRaw = searchParams.get("season");
    const weekRaw = searchParams.get("week");

    const season = seasonRaw ? Number(seasonRaw.trim()) : new Date().getFullYear();
    const week = weekRaw ? Number(weekRaw.trim()) : NaN;

    if (Number.isNaN(season)) {
      return NextResponse.json(
        { success: false, message: "Invalid season" },
        { status: 400 },
      );
    }

    const rows = Number.isNaN(week)
      ? await getGamesBySeasonOrdered(season)
      : await getGamesBySeasonWeekOrdered(season, week);

    return NextResponse.json(
      { success: true, count: rows.length, rows },
      { status: 200 },
    );
  } catch (err: any) {
    console.error("API /api/games error:", err);
    return NextResponse.json(
      { success: false, message: err?.message ?? "Internal server error" },
      { status: 500 },
    );
  }
}



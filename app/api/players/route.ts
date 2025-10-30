// app/api/players/route.ts
import { NextResponse } from "next/server";
import { getAllPlayers, getPlayersByTeam } from "../../../lib/db";

// This handles GET /api/players
export async function GET(request: Request) {
  // read URL params like /api/players?team=BUF
  const { searchParams } = new URL(request.url);
  const team = searchParams.get("team");

  let data;
  if (team) {
    data = getPlayersByTeam(team);
  } else {
    data = getAllPlayers();
  }

  return NextResponse.json({
    success: true,
    count: data.length,
    players: data,
  });
}

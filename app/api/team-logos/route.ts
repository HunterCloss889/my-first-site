// app/api/team-logos/route.ts
import { NextResponse } from "next/server";
import { getAllTeamLogos } from "@/lib/db";

export async function GET() {
  try {
    const logos = await getAllTeamLogos();
    const logosObj = Object.fromEntries(logos);
    console.log("Returning logos:", Object.keys(logosObj).length, "teams");
    return NextResponse.json(
      { success: true, logos: logosObj },
      { status: 200 },
    );
  } catch (err: any) {
    console.error("API /api/team-logos error:", err);
    return NextResponse.json(
      { success: false, message: err?.message ?? "Internal server error" },
      { status: 500 },
    );
  }
}


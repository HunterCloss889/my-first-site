// lib/db.ts
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

export type PlayerGameRow = {
  player_id: string;
  player_display_name: string;
  position: string;
  recent_team: string;
  season: number;
  week: number;
  opponent_team: string | null;
  completions: number | null;
  attempts: number | null;
  passing_yards: number | null;
  passing_tds: number | null;
  interceptions: number | null;
  carries: number | null;
  rushing_yards: number | null;
  rushing_tds: number | null;
  receptions: number | null;
  targets: number | null;
  receiving_yards: number | null;
  receiving_tds: number | null;
};

const dbPath = path.join(process.cwd(), "app", "nfl_player_stats.db");

export async function openDb() {
  return open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
}

export async function getStatsByTeamAndSeason(team: string, season: number): Promise<PlayerGameRow[]> {
  const db = await openDb();
  return db.all(
    `
    SELECT *
    FROM player_game_stats
    WHERE lower(recent_team) = lower(?)
      AND season = ?
    ORDER BY week ASC, player_display_name ASC
    `,
    [team, season]
  );
}

export async function getStatsByTeam(team: string): Promise<PlayerGameRow[]> {
  const db = await openDb();
  return db.all(
    `
    SELECT *
    FROM player_game_stats
    WHERE lower(recent_team) = lower(?)
    ORDER BY season DESC, week DESC, player_display_name ASC
    `,
    [team]
  );
}

export async function getRecentStats(limit = 100): Promise<PlayerGameRow[]> {
  const db = await openDb();
  return db.all(
    `
    SELECT *
    FROM player_game_stats
    ORDER BY season DESC, week DESC
    LIMIT ?
    `,
    [limit]
  );
}

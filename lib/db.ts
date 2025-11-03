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
const gamesDbPath = path.join(process.cwd(), "app", "games.db");

export async function openDb() {
  return open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
}

export type GameRow = {
  game_id: string;
  season: number;
  game_type: string | null;
  week: number;
  gameday: string | null; // e.g. 2025-11-09
  weekday: string | null;
  gametime: string | null; // e.g. 13:00:00
  away_team: string;
  away_score: number | null;
  home_team: string;
  home_score: number | null;
  location: string | null;
  result: string | null;
  total: number | null;
  overtime: number | null;
  old_game_id: string | null;
  gsis: string | null;
  nfl_detail_id: string | null;
  pfr: string | null;
  pff: string | null;
  espn: string | null;
  ftn: string | null;
  away_rest: number | null;
  home_rest: number | null;
  div_game: number | null;
  roof: string | null;
  surface: string | null;
  stadium_id: string | null;
  stadium: string | null;
};

export async function openGamesDb() {
  return open({
    filename: gamesDbPath,
    driver: sqlite3.Database,
  });
}

export async function getGamesBySeasonWeekOrdered(
  season: number,
  week: number,
): Promise<GameRow[]> {
  const db = await openGamesDb();
  return db.all(
    `
    SELECT *
    FROM games
    WHERE season = ? AND week = ?
    ORDER BY gameday ASC, gametime ASC, away_team ASC
    `,
    [season, week],
  );
}

export async function getGamesBySeasonOrdered(
  season: number,
): Promise<GameRow[]> {
  const db = await openGamesDb();
  return db.all(
    `
    SELECT *
    FROM games
    WHERE season = ?
    ORDER BY gameday ASC, gametime ASC, week ASC, away_team ASC
    `,
    [season],
  );
}

export async function getGameById(gameId: string): Promise<GameRow | undefined> {
  const db = await openGamesDb();
  const row = await db.get(
    `
    SELECT *
    FROM games
    WHERE TRIM(CAST(game_id AS TEXT)) = TRIM(?)
    LIMIT 1
    `,
    [String(gameId)],
  );
  return row as GameRow | undefined;
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

export async function getDefensiveRankings(season: number): Promise<
  Array<{ team: string; passRank: number; passYpg: number; rushRank: number; rushYpg: number }>
> {
  const db = await openDb();
  // total receiving/passing yards and rushing yards allowed by team via opponent_team
  // games played = weeks with at least 1 opponent_row
  const stats = await db.all(
    `
    SELECT
      opponent_team AS team,
      SUM(COALESCE(receiving_yards, 0)) AS pass_yds_allowed,
      SUM(COALESCE(rushing_yards, 0)) AS rush_yds_allowed,
      COUNT(DISTINCT week) AS games_played
    FROM player_game_stats
    WHERE season = ?
      AND opponent_team IS NOT NULL
    GROUP BY opponent_team
    ORDER BY opponent_team ASC
    `,
    [season]
  );
  const withAvg = stats.map((s: any) => ({
    team: s.team,
    passYds: s.pass_yds_allowed || 0,
    passYpg: (s.pass_yds_allowed || 0) / (s.games_played || 1),
    rushYds: s.rush_yds_allowed || 0,
    rushYpg: (s.rush_yds_allowed || 0) / (s.games_played || 1),
  }));
  // sort and rank: ascending = lower yards = better defense = rank 1
  withAvg.sort((a, b) => a.passYpg - b.passYpg);
  const withPassRank = withAvg.map((s, idx) => ({ ...s, passRank: idx + 1 }));
  withPassRank.sort((a, b) => a.rushYpg - b.rushYpg);
  return withPassRank.map((s, idx) => ({
    team: s.team,
    passRank: s.passRank,
    passYpg: Number((s.passYpg || 0).toFixed(1)),
    rushRank: idx + 1,
    rushYpg: Number((s.rushYpg || 0).toFixed(1)),
  }));
}

export async function getPlayerStatsAgainstOpponent(
  playerId: string,
  opponentTeam: string,
  currentSeason: number
): Promise<PlayerGameRow[]> {
  const db = await openDb();
  return db.all(
    `
    SELECT *
    FROM player_game_stats
    WHERE player_id = ?
      AND lower(opponent_team) = lower(?)
    ORDER BY season DESC, week DESC
    `,
    [playerId, opponentTeam]
  );
}

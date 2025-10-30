// lib/db.ts
export type Player = {
    id: number;
    name: string;
    team: string;
    recYards: number;
    rushYards: number;
    passYards: number;
  };
  
  const players: Player[] = [
    {
      id: 1,
      name: "Tee Higgins",
      team: "CIN",
      recYards: 1100,
      rushYards: 20,
      passYards: 0,
    },
    {
      id: 2,
      name: "Josh Allen",
      team: "BUF",
      recYards: 120,
      rushYards: 500,
      passYards: 4300,
    },
    {
      id: 3,
      name: "Christian McCaffrey",
      team: "SF",
      recYards: 700,
      rushYards: 1500,
      passYards: 0,
    },
  ];
  
  export function getAllPlayers(): Player[] {
    // in real life this is where you'd query sqlite / Postgres etc.
    return players;
  }
  
  export function getPlayersByTeam(team: string): Player[] {
    return players.filter(
      (p) => p.team.toLowerCase() === team.toLowerCase()
    );
  }
  
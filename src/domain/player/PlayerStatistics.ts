import { Player } from "./Player";

export interface CountryWinRatio {
  code: string;
  wins: number;
  matches: number;
  ratio: number;
}

/**
 * Get best player country by win ratio.
 */
export function bestCountryByWinRatio(players: Player[]): CountryWinRatio | null {
  const byCountry = new Map<string, { wins: number; matches: number }>();
  for (const player of players) {
    const totals = byCountry.get(player.countryCode) ?? { wins: 0, matches: 0 };
    totals.wins += player.wins;
    totals.matches += player.matchesPlayed;
    byCountry.set(player.countryCode, totals);
  }

  let best: CountryWinRatio | null = null;
  for (const [code, { wins, matches }] of byCountry) {
    if (matches === 0) continue;
    const ratio = wins / matches;
    if (!best || ratio > best.ratio || (ratio === best.ratio && matches > best.matches)) {
      best = { code, wins, matches, ratio };
    }
  }
  return best;
}

export function averageBmi(players: Player[]): number | null {
  if (players.length === 0) return null;
  return players.reduce((sum, p) => sum + p.bmi, 0) / players.length;
}

export function medianHeight(players: Player[]): number | null {
  if (players.length === 0) return null;
  const heights = players.map((p) => p.height).sort((a, b) => a - b);
  const middle = Math.floor(heights.length / 2);
  return heights.length % 2 === 1 ? heights[middle] : (heights[middle - 1] + heights[middle]) / 2;
}

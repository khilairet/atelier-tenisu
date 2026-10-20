import { averageBmi, bestCountryByWinRatio, CountryWinRatio, medianHeight } from "../../domain/player/PlayerStatistics";
import { PlayerFilter } from "../../domain/player/Player";
import { PlayerRepository } from "../../domain/player/PlayerRepository";

export interface PlayerStatisticsDto {
  bestCountryByWinRatio: CountryWinRatio | null;
  averageBmi: number | null;
  medianHeight: number | null;
}

const round = (value: number | null, decimals = 2): number | null =>
  value === null ? null : Number(value.toFixed(decimals));

/**
 * Use case player statistics
 */
export class PlayerStatisticsService {
  constructor(private readonly repository: PlayerRepository) {}

  async getStatistics(filter: PlayerFilter = {}): Promise<PlayerStatisticsDto> {
    const players = await this.repository.findAll();
    const filterPlayers = players.filter((p) => p.matches(filter));
    const bestCountry = bestCountryByWinRatio(filterPlayers);

    return {
      bestCountryByWinRatio: bestCountry && { ...bestCountry, ratio: round(bestCountry.ratio)! },
      averageBmi: round(averageBmi(filterPlayers)),
      medianHeight: medianHeight(filterPlayers),
    };
  }
}

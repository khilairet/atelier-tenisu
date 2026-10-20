import { averageBmi, bestCountryByWinRatio, CountryWinRatio, medianHeight } from "../../domain/player/PlayerStatistics";
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

  async getStatistics(): Promise<PlayerStatisticsDto> {
    const players = await this.repository.findAll();
    const bestCountry = bestCountryByWinRatio(players);

    return {
      bestCountryByWinRatio: bestCountry && { ...bestCountry, ratio: round(bestCountry.ratio)! },
      averageBmi: round(averageBmi(players)),
      medianHeight: medianHeight(players),
    };
  }
}

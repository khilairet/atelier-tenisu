import { Player, PlayerAttributes, PlayerFilter, PlayerProps } from "../../domain/player/Player";
import { PlayerNotFoundError } from "../../domain/player/errors";
import { PlayerRepository } from "../../domain/player/PlayerRepository";

export interface PageRequest {
  page: number;
  limit: number;
}

export interface Page<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

/**
 * Use case player service
 */
export class PlayerService {
  constructor(private readonly repository: PlayerRepository) {}

  async listPlayers(filter: PlayerFilter = {}, { page, limit }: PageRequest = { page: 1, limit: 20 }): Promise<Page<PlayerProps>> {
    const players = (await this.repository.findAll()).filter((p) => p.matches(filter)).sort(Player.compareByRanking);
    const start = (page - 1) * limit;
    return {
      data: players.slice(start, start + limit).map((p) => p.toPrimitives()),
      pagination: { page, limit, total: players.length, totalPages: Math.ceil(players.length / limit) },
    };
  }

  async getPlayer(id: number): Promise<PlayerProps> {
    return (await this.findPlayer(id)).toPrimitives();
  }

  async createPlayer(attributes: PlayerAttributes): Promise<PlayerProps> {
    const player = Player.create({ ...attributes, id: await this.repository.nextId() });
    await this.repository.save(player);
    return player.toPrimitives();
  }

  async updatePlayer(id: number, attributes: PlayerAttributes): Promise<PlayerProps> {
    const player = await this.findPlayer(id);
    player.update(attributes);
    await this.repository.save(player);
    return player.toPrimitives();
  }

  async deletePlayer(id: number): Promise<void> {
    if (!(await this.repository.delete(id))) {
      throw new PlayerNotFoundError(id);
    }
  }

  private async findPlayer(id: number): Promise<Player> {
    const player = await this.repository.findById(id);
    if (!player) {
      throw new PlayerNotFoundError(id);
    }
    return player;
  }
}

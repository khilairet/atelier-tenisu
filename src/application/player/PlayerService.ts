import { Player, PlayerAttributes, PlayerProps } from "../../domain/player/Player";
import { PlayerNotFoundError } from "../../domain/player/errors";
import { PlayerRepository } from "../../domain/player/PlayerRepository";

/**
 * Use case player service
 */
export class PlayerService {
  constructor(private readonly repository: PlayerRepository) {}

  async listPlayers(): Promise<PlayerProps[]> {
    const players = await this.repository.findAll();
    return players.sort(Player.compareByRanking).map((p) => p.toPrimitives());
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

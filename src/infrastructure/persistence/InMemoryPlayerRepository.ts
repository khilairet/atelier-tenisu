import { Player, PlayerProps } from "../../domain/player/Player";
import { PlayerRepository } from "../../domain/player/PlayerRepository";
import seed from "../data/headtohead.json";

export class InMemoryPlayerRepository implements PlayerRepository {
  private readonly players = new Map<number, Player>();

  constructor(initial: PlayerProps[] = []) {
    for (const props of initial) {
      this.players.set(props.id, Player.create(props));
    }
  }

  static fromSeed(): InMemoryPlayerRepository {
    return new InMemoryPlayerRepository(seed.players as PlayerProps[]);
  }

  async findAll(): Promise<Player[]> {
    return [...this.players.values()];
  }

  async findById(id: number): Promise<Player | null> {
    return this.players.get(id) ?? null;
  }

  async nextId(): Promise<number> {
    return Math.max(0, ...this.players.keys()) + 1;
  }

  async save(player: Player): Promise<void> {
    this.players.set(player.id, player);
  }

  async delete(id: number): Promise<boolean> {
    return this.players.delete(id);
  }
}

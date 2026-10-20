import { Player } from "./Player";

export interface PlayerRepository {
  findAll(): Promise<Player[]>;
  findById(id: number): Promise<Player | null>;
  nextId(): Promise<number>;
  save(player: Player): Promise<void>;
  delete(id: number): Promise<boolean>;
}

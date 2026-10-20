import { InvalidPlayerError } from "./errors";

export type Sex = "M" | "F";
export type MatchResult = 0 | 1;

export interface Country {
  picture: string;
  code: string;
}

export interface PlayerStats {
  rank: number;
  points: number;
  weight: number;
  height: number;
  age: number;
  last: MatchResult[];
}

export interface PlayerProps {
  id: number;
  firstname: string;
  lastname: string;
  shortname: string;
  sex: Sex;
  country: Country;
  picture: string;
  data: PlayerStats;
}

export type PlayerAttributes = Omit<PlayerProps, "id">;

export class Player {
  private constructor(private props: PlayerProps) {}

  static create(props: PlayerProps): Player {
    Player.assertInvariants(props);
    return new Player(structuredClone(props));
  }

  get id(): number {
    return this.props.id;
  }

  get rank(): number {
    return this.props.data.rank;
  }

  get points(): number {
    return this.props.data.points;
  }

  update(attributes: PlayerAttributes): void {
    const next: PlayerProps = { ...structuredClone(attributes), id: this.props.id };
    Player.assertInvariants(next);
    this.props = next;
  }

  static compareByRanking(a: Player, b: Player): number {
    return a.rank - b.rank || b.points - a.points;
  }

  toPrimitives(): PlayerProps {
    return structuredClone(this.props);
  }

  private static assertInvariants(props: PlayerProps): void {
    if (!Number.isInteger(props.id) || props.id <= 0) {
      throw new InvalidPlayerError("L'identifiant doit être un entier positif");
    }
    if (!props.firstname.trim() || !props.lastname.trim()) {
      throw new InvalidPlayerError("Le prénom et le nom sont obligatoires");
    }
    if (!Number.isInteger(props.data.rank) || props.data.rank < 1) {
      throw new InvalidPlayerError("Le rang doit être un entier supérieur ou égal à 1");
    }
    if (props.data.points < 0) {
      throw new InvalidPlayerError("Les points ne peuvent pas être négatifs");
    }
    if (props.data.weight <= 0 || props.data.height <= 0 || props.data.age <= 0) {
      throw new InvalidPlayerError("Le poids, la taille et l'âge doivent être positifs");
    }
    if (props.data.last.some((r) => r !== 0 && r !== 1)) {
      throw new InvalidPlayerError("Les derniers résultats doivent valoir 0 ou 1");
    }
  }
}

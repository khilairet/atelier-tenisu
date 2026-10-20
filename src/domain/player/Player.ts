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

export interface PlayerFilter {
  countryCode?: string;
  sex?: Sex;
}

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

  get countryCode(): string {
    return this.props.country.code;
  }

  get sex(): Sex {
    return this.props.sex;
  }

  matches(filter: PlayerFilter): boolean {
    return (
      (filter.countryCode === undefined || this.countryCode === filter.countryCode) &&
      (filter.sex === undefined || this.sex === filter.sex)
    );
  }

  get height(): number {
    return this.props.data.height;
  }

  get wins(): number {
    return this.props.data.last.filter((r) => r === 1).length;
  }

  get matchesPlayed(): number {
    return this.props.data.last.length;
  }

  /** BMI = weight (kg) / height (m)² */
  get bmi(): number {
    const weightKg = this.props.data.weight / 1000;
    const heightM = this.props.data.height / 100;
    return weightKg / (heightM * heightM);
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
      throw new InvalidPlayerError("Id must be a positive integer");
    }
    if (!props.firstname.trim() || !props.lastname.trim()) {
      throw new InvalidPlayerError("Firstname and lastname are required");
    }
    if (!Number.isInteger(props.data.rank) || props.data.rank < 1) {
      throw new InvalidPlayerError("Rank must be an integer greater than or equal to 1");
    }
    if (props.data.points < 0) {
      throw new InvalidPlayerError("Points cannot be negative");
    }
    if (props.data.weight <= 0 || props.data.height <= 0 || props.data.age <= 0) {
      throw new InvalidPlayerError("Weight, height and age must be positive");
    }
    if (props.data.last.some((r) => r !== 0 && r !== 1)) {
      throw new InvalidPlayerError("Last results must be 0 or 1");
    }
  }
}

export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidPlayerError extends DomainError {}

export class PlayerNotFoundError extends DomainError {
  constructor(id: number) {
    super(`Player ${id} not found`);
  }
}

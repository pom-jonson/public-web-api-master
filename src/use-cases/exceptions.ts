export class NotFoundError extends Error {
  constructor(readonly resource: string) {
    super(`Resource ${resource} could not be found.`);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class InvalidParameterError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, InvalidParameterError.prototype);
  }

  static withGenericMessage(parameter: string, value: unknown): InvalidParameterError {
    return new InvalidParameterError(
      `Value '${JSON.stringify(value)}' of parameter '${parameter}' is invalid.`,
    );
  }
}

export class UnexpectedError extends Error {
  constructor(readonly message: string) {
    super(message);
    Object.setPrototypeOf(this, UnexpectedError.prototype);
  }
}

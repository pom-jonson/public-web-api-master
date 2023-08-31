export default class ValidationFailedError extends Error {
  constructor(readonly validationErrors: unknown) {
    super('Paylod validation failed.');
    Object.setPrototypeOf(this, ValidationFailedError.prototype);
  }
}

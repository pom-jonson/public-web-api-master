/* istanbul ignore file */

export default class UnauthorizedError extends Error {
  constructor(readonly message: string) {
    super(message);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

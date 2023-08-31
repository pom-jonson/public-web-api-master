export default class InvalidRequestError extends Error {
  constructor(readonly message: string) {
    super(message);
    Object.setPrototypeOf(this, InvalidRequestError.prototype);
  }
}

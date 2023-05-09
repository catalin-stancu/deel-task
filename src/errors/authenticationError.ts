export default class AuthenticationError extends Error {
  name: string;

  cause?: Error;

  stack?: string;

  constructor(msg: string, cause?: Error) {
    super(msg);
    this.name = 'AuthenticationError';
    this.cause = cause;

    if (this.cause instanceof Error) {
      this.stack = cause.stack;
    }
  }
}

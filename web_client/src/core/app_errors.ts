export type AppErrorMeta = {
  readonly cause?: unknown;
};

export class AppError<Code extends string = string> extends Error {
  readonly code: Code;

  readonly details?: AppErrorMeta;

  constructor(code: Code, message: string, details?: AppErrorMeta) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.details = details;
  }
}

export type Result<T, E extends AppError = AppError> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E extends AppError>(error: E): Result<never, E> {
  return { ok: false, error };
}

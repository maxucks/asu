import type { AppError } from "@/core/app_errors"
import type { Context } from "hono"
import type { ContentfulStatusCode } from "hono/utils/http-status"

export type ApiErrorBody = {
  readonly code: string
  readonly message: string
}

export function toApiErrorBody(error: AppError): ApiErrorBody {
  return { code: error.code, message: error.message }
}

function isSuccessfulStatus(status: ContentfulStatusCode): boolean {
  return status >= 200 && status < 300
}

/** JSON response with an explicit 2xx status (use `ok` / `created` for the common codes). */
export function data(c: Context, body: unknown, status: ContentfulStatusCode): Response {
  if (!isSuccessfulStatus(status)) {
    throw new Error(`data() expects a 2xx status, got ${status}`)
  }
  return c.json(body, status)
}

export function ok(c: Context, body: unknown): Response {
  return data(c, body, 200)
}

export function created(c: Context, body: unknown): Response {
  return data(c, body, 201)
}

export function noContent(c: Context): Response {
  return c.body(null, 204)
}

/** Application error JSON; pass `status` when it is not 400/404/500. */
export function error(
  c: Context,
  appError: AppError,
  status: ContentfulStatusCode = 400,
): Response {
  return c.json(toApiErrorBody(appError), status)
}

export function badRequest(c: Context, appError: AppError): Response {
  return error(c, appError, 400)
}

export function notFound(c: Context, appError: AppError): Response {
  return error(c, appError, 404)
}

const HttpErrorCodeInternal = "internal_error"

export function internalError(c: Context, message = "Internal server error"): Response {
  return c.json({ code: HttpErrorCodeInternal, message } satisfies ApiErrorBody, 500)
}

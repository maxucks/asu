const DefaultAsuApiUrl = "http://127.0.0.1:3001"

type ApiErrorBody = {
  readonly code?: string
  readonly message?: string
}

export function asuApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_ASU_API_URL?.trim()
  return fromEnv && fromEnv.length > 0 ? fromEnv : DefaultAsuApiUrl
}

export async function requestJson<T>(
  baseUrl: string,
  method: string,
  path: string,
  body?: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const payload = (await response.json()) as T | ApiErrorBody

  if (!response.ok) {
    const apiError = payload as ApiErrorBody
    const message =
      typeof apiError.message === "string" && apiError.message.length > 0
        ? apiError.message
        : `Request failed (${response.status})`
    throw new Error(message)
  }

  return payload as T
}

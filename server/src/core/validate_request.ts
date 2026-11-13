import { err, ok } from "@/core/app_errors"
import type { Result } from "@/core/app_errors"
import { practiceAssociationSaveFailedWithMessage } from "@/practice/practice_errors"
import type { PracticeError } from "@/practice/practice_errors"
import type { Context } from "hono"
import type { z } from "zod"

function practiceErrorFromZodIssue(error: z.ZodError): PracticeError {
  const message = error.issues[0]?.message ?? "Invalid request"
  return practiceAssociationSaveFailedWithMessage(message)
}

export function parseRouteParams<T extends z.ZodType>(
  params: Record<string, string>,
  schema: T,
): Result<z.infer<T>, PracticeError> {
  const parsed = schema.safeParse(params)
  if (!parsed.success) {
    return err(practiceErrorFromZodIssue(parsed.error))
  }
  return ok(parsed.data)
}

export async function parseJsonBody<T extends z.ZodType>(
  c: Context,
  schema: T,
): Promise<Result<z.infer<T>, PracticeError>> {
  let raw: unknown
  try {
    raw = await c.req.json()
  } catch {
    return err(practiceAssociationSaveFailedWithMessage("Invalid JSON body"))
  }

  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    return err(practiceErrorFromZodIssue(parsed.error))
  }
  return ok(parsed.data)
}

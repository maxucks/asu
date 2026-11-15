import { PracticeErrorMessages } from "@/practice/practice_errors"
import { z } from "zod"

function parseAssociationText(raw: string): string | null {
  const text = raw.trim()
  return text.length > 0 ? text : null
}

function parseAssociationImageUrl(raw: string): string | null {
  const trimmed = raw.trim()
  if (trimmed.length === 0 || trimmed.length > 2048) return null

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    return null
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null
  return parsed.toString()
}

const routeId = z.string().min(1, "Route id is required.")

export const practiceCaseIdParamsSchema = z.object({
  caseId: routeId,
})

export const practiceCaseAssociationParamsSchema = practiceCaseIdParamsSchema.extend({
  associationId: routeId,
})

const associationTextField = z
  .string()
  .transform((raw) => parseAssociationText(raw))
  .refine((value): value is string => value !== null, {
    message: PracticeErrorMessages.AssociationEmptyText,
  })

const associationImageUrlField = z
  .string()
  .transform((raw) => parseAssociationImageUrl(raw))
  .refine((value): value is string => value !== null, {
    message: PracticeErrorMessages.AssociationInvalidImageUrl,
  })

export const practiceAssociationTextBodySchema = z.object({
  text: associationTextField,
})

export const practiceAssociationImageUrlBodySchema = z.object({
  url: associationImageUrlField,
})

export const practiceAssociationHiddenBodySchema = z.object({
  hiddenFromPractice: z.boolean(),
})

const caseLemmaField = z
  .string()
  .transform((raw) => raw.trim())
  .refine((value) => value.length > 0, {
    message: PracticeErrorMessages.CaseLemmaEmpty,
  })

export const practiceCreateCaseBodySchema = z.object({
  lemmaText: caseLemmaField,
  meaning: z
    .string()
    .optional()
    .transform((raw) => {
      if (raw === undefined) return null
      const text = raw.trim()
      return text.length > 0 ? text : null
    }),
})

export const practiceUpdateCaseBodySchema = z
  .object({
    lemmaText: caseLemmaField.optional(),
    meaning: z
      .string()
      .nullable()
      .optional()
      .transform((raw) => {
        if (raw === undefined) return undefined
        if (raw === null) return null
        const text = raw.trim()
        return text.length > 0 ? text : null
      }),
  })
  .refine((value) => value.lemmaText !== undefined || value.meaning !== undefined, {
    message: "Provide lemma or meaning to update.",
  })

import { DEFAULT_ASSOCIATION_TILE_COLOR_ID, isAssociationTileColorId } from "@/practice/association_tile_colors"
import { PracticeErrorMessages } from "@/practice/practice_errors"
import { PracticeGrades } from "@/practice/practice_repository"
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

const associationTileColorField = z
  .string()
  .optional()
  .transform((raw) => {
    if (raw === undefined) return DEFAULT_ASSOCIATION_TILE_COLOR_ID
    return isAssociationTileColorId(raw) ? raw : DEFAULT_ASSOCIATION_TILE_COLOR_ID
  })

export const practiceAssociationTextBodySchema = z.object({
  text: associationTextField,
  tileColor: associationTileColorField,
})

export const practiceAssociationImageUrlBodySchema = z.object({
  url: associationImageUrlField,
})

export const practiceAssociationHiddenBodySchema = z.object({
  hiddenFromPractice: z.boolean(),
})

export const practiceAssociationOrderBodySchema = z.object({
  associationIds: z.array(routeId).min(1, "At least one association id is required."),
})

export const practiceGradeBodySchema = z.object({
  grade: z.enum(PracticeGrades),
})

const caseValueField = z
  .string()
  .transform((raw) => raw.trim())
  .refine((value) => value.length > 0, {
    message: PracticeErrorMessages.CaseValueEmpty,
  })

export const practiceQueueQuerySchema = z.object({
  languageId: routeId,
  categoryId: routeId.optional(),
})

export const practiceNextCardQuerySchema = z.object({
  languageId: routeId,
  excludeCaseId: routeId.optional(),
  categoryId: routeId.optional(),
})

export const practiceSessionQuerySchema = z.object({
  languageId: routeId,
  categoryId: routeId.optional(),
})

const categoryNameField = z
  .string()
  .transform((raw) => raw.trim().replace(/\s+/g, " "))
  .refine((value) => value.length > 0, { message: "Category name cannot be empty." })

export const practiceCreateCategoryBodySchema = z.object({
  languageId: routeId,
  name: categoryNameField,
})

export const practiceSetCaseCategoriesBodySchema = z.object({
  categoryIds: z.array(routeId),
})

const caseRepresentationWriteSchema = z.object({
  representationTypeId: z.number().int().positive(),
  value: z.string().nullable(),
})

export const practiceCreateCaseBodySchema = z.object({
  languageId: routeId,
  value: caseValueField,
  meaning: z
    .string()
    .optional()
    .transform((raw) => {
      if (raw === undefined) return null
      const text = raw.trim()
      return text.length > 0 ? text : null
    }),
  representations: z.array(caseRepresentationWriteSchema).optional(),
})

export const practiceUpdateCaseBodySchema = z
  .object({
    value: caseValueField.optional(),
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
    representations: z.array(caseRepresentationWriteSchema).optional(),
  })
  .refine(
    (value) =>
      value.value !== undefined || value.meaning !== undefined || value.representations !== undefined,
    {
      message: "Provide value, meaning, or representations to update.",
    },
  )

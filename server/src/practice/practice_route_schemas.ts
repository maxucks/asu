import {
  PracticeErrorMessages,
  parsePracticeAssociationText,
  parsePracticeImageAssociationUrl,
} from "@asu/contracts"
import { z } from "zod"

const routeId = z.string().min(1, "Route id is required.")

export const practiceCaseIdParamsSchema = z.object({
  caseId: routeId,
})

export const practiceCaseAssociationParamsSchema = practiceCaseIdParamsSchema.extend({
  associationId: routeId,
})

const associationTextField = z
  .string()
  .transform((raw) => parsePracticeAssociationText(raw))
  .refine((value): value is string => value !== null, {
    message: PracticeErrorMessages.AssociationEmptyText,
  })

const associationImageUrlField = z
  .string()
  .transform((raw) => parsePracticeImageAssociationUrl(raw))
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

import { AppError } from "@/core/app_errors"
import type { ContentfulStatusCode } from "hono/utils/http-status"

export const PracticeErrorCodes = {
  NoCards: "practice_no_cards",
  CardNotFound: "practice_card_not_found",
  InvalidGrade: "practice_invalid_grade",
  AssociationSaveFailed: "practice_association_save_failed",
  AssociationNotFound: "practice_association_not_found",
  LanguageNotFound: "practice_language_not_found",
  LanguageHasCases: "practice_language_has_cases",
  LanguageInvalid: "practice_language_invalid",
} as const

export type PracticeErrorCode = (typeof PracticeErrorCodes)[keyof typeof PracticeErrorCodes]

export const PracticeErrorMessages = {
  AssociationEmptyText: "Association text cannot be empty.",
  AssociationInvalidImageUrl: "Enter a valid http or https image URL.",
  AssociationWrongKind: "This association cannot be edited that way.",
  AssociationNotOnCard: "That association is no longer on this card.",
  QueueEmpty: "Nothing to review in the queue.",
  AssociationSaveFailed: "Could not save association.",
  PracticeDataFailed: "Practice data failed.",
  CaseLemmaEmpty: "Word / lemma cannot be empty.",
  LanguageNameEmpty: "Language name cannot be empty.",
  LanguageIconEmpty: "Pick an icon for the language.",
  LanguageHasCases: "Delete all vocabulary entries in this language first.",
  LanguageNotFound: "Language not found.",
} as const

export class PracticeError extends AppError<PracticeErrorCode> {
  constructor(code: PracticeErrorCode, message: string) {
    super(code, message)
    this.name = "PracticeError"
  }
}

export const PracticeErrAssociationEmptyText = new PracticeError(
  PracticeErrorCodes.AssociationSaveFailed,
  PracticeErrorMessages.AssociationEmptyText,
)

export const PracticeErrAssociationInvalidImageUrl = new PracticeError(
  PracticeErrorCodes.AssociationSaveFailed,
  PracticeErrorMessages.AssociationInvalidImageUrl,
)

export const PracticeErrAssociationWrongKind = new PracticeError(
  PracticeErrorCodes.AssociationSaveFailed,
  PracticeErrorMessages.AssociationWrongKind,
)

export const PracticeErrAssociationNotOnCard = new PracticeError(
  PracticeErrorCodes.AssociationNotFound,
  PracticeErrorMessages.AssociationNotOnCard,
)

export const PracticeErrQueueEmpty = new PracticeError(
  PracticeErrorCodes.NoCards,
  PracticeErrorMessages.QueueEmpty,
)

export const PracticeErrAssociationSaveFailed = new PracticeError(
  PracticeErrorCodes.AssociationSaveFailed,
  PracticeErrorMessages.AssociationSaveFailed,
)

export const PracticeErrPracticeDataFailed = new PracticeError(
  PracticeErrorCodes.NoCards,
  PracticeErrorMessages.PracticeDataFailed,
)

export const PracticeErrCaseLemmaEmpty = new PracticeError(
  PracticeErrorCodes.AssociationSaveFailed,
  PracticeErrorMessages.CaseLemmaEmpty,
)

export const PracticeErrLanguageNotFound = new PracticeError(
  PracticeErrorCodes.LanguageNotFound,
  PracticeErrorMessages.LanguageNotFound,
)

export const PracticeErrLanguageHasCases = new PracticeError(
  PracticeErrorCodes.LanguageHasCases,
  PracticeErrorMessages.LanguageHasCases,
)

export const PracticeErrLanguageInvalid = new PracticeError(
  PracticeErrorCodes.LanguageInvalid,
  PracticeErrorMessages.LanguageIconEmpty,
)

export function practiceLanguageNotFoundError(message: string): PracticeError {
  return new PracticeError(PracticeErrorCodes.LanguageNotFound, message)
}

export function practiceLanguageHasCasesError(message: string): PracticeError {
  return new PracticeError(PracticeErrorCodes.LanguageHasCases, message)
}

export function practiceLanguageInvalidError(message: string): PracticeError {
  return new PracticeError(PracticeErrorCodes.LanguageInvalid, message)
}

export function practiceLanguageErrorFromThrown(thrown: unknown): PracticeError {
  if (thrown instanceof Error) {
    if (thrown.message.startsWith("Language not found")) {
      return practiceLanguageNotFoundError(thrown.message)
    }
    if (thrown.message.startsWith("Language has cases")) {
      return practiceLanguageHasCasesError(PracticeErrorMessages.LanguageHasCases)
    }
  }
  return PracticeErrLanguageInvalid
}

export function practiceCardNotFoundError(message: string): PracticeError {
  return new PracticeError(PracticeErrorCodes.CardNotFound, message)
}

export function practiceAssociationNotFoundError(message: string): PracticeError {
  return new PracticeError(PracticeErrorCodes.AssociationNotFound, message)
}

export function practiceAssociationSaveFailedWithMessage(message: string): PracticeError {
  return new PracticeError(PracticeErrorCodes.AssociationSaveFailed, message)
}

export function practiceNoCardsError(message: string): PracticeError {
  return new PracticeError(PracticeErrorCodes.NoCards, message)
}

export function practiceAssociationErrorFromThrown(thrown: unknown): PracticeError {
  if (thrown instanceof Error) {
    if (thrown.message.startsWith("Record not found")) {
      return practiceCardNotFoundError(thrown.message)
    }
    if (thrown.message.startsWith("Association not found")) {
      return practiceAssociationNotFoundError(thrown.message)
    }
    return practiceAssociationSaveFailedWithMessage(thrown.message)
  }
  return PracticeErrAssociationSaveFailed
}

export function practiceQueueErrorFromThrown(thrown: unknown): PracticeError {
  if (thrown instanceof Error) {
    if (thrown.message.startsWith("Record not found")) {
      return practiceCardNotFoundError(thrown.message)
    }
    return practiceNoCardsError(thrown.message)
  }
  return PracticeErrPracticeDataFailed
}

export function practiceErrorHttpStatus(code: PracticeErrorCode): ContentfulStatusCode {
  switch (code) {
    case PracticeErrorCodes.CardNotFound:
    case PracticeErrorCodes.AssociationNotFound:
    case PracticeErrorCodes.NoCards:
    case PracticeErrorCodes.LanguageNotFound:
      return 404
    case PracticeErrorCodes.LanguageHasCases:
      return 409
    default:
      return 400
  }
}

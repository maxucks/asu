import { AppError } from "@/core/app_errors";

export const PracticeErrorCodes = {
  NoCards: "practice_no_cards",
  CardNotFound: "practice_card_not_found",
  InvalidGrade: "practice_invalid_grade",
  AssociationSaveFailed: "practice_association_save_failed",
  AssociationNotFound: "practice_association_not_found",
  LanguageNotFound: "practice_language_not_found",
  LanguageInvalid: "practice_language_invalid",
} as const;

export type PracticeErrorCode = (typeof PracticeErrorCodes)[keyof typeof PracticeErrorCodes];

export const PracticeErrorMessages = {
  AssociationEmptyText: "Association text cannot be empty.",
  AssociationInvalidImageUrl: "Enter a valid http or https image URL.",
  AssociationWrongKind: "This association cannot be edited that way.",
  AssociationNotOnCard: "That association is no longer on this card.",
  QueueEmpty: "Nothing to review in the queue.",
  AssociationSaveFailed: "Could not save association.",
  PracticeDataFailed: "Practice data failed.",
  CaseValueEmpty: "Case value cannot be empty.",
} as const;

export class PracticeError extends AppError<PracticeErrorCode> {
  constructor(code: PracticeErrorCode, message: string) {
    super(code, message);
    this.name = "PracticeError";
  }
}

export const PracticeErrAssociationEmptyText = new PracticeError(
  PracticeErrorCodes.AssociationSaveFailed,
  PracticeErrorMessages.AssociationEmptyText,
);

export const PracticeErrAssociationInvalidImageUrl = new PracticeError(
  PracticeErrorCodes.AssociationSaveFailed,
  PracticeErrorMessages.AssociationInvalidImageUrl,
);

export const PracticeErrAssociationWrongKind = new PracticeError(
  PracticeErrorCodes.AssociationSaveFailed,
  PracticeErrorMessages.AssociationWrongKind,
);

export const PracticeErrAssociationNotOnCard = new PracticeError(
  PracticeErrorCodes.AssociationNotFound,
  PracticeErrorMessages.AssociationNotOnCard,
);

export const PracticeErrQueueEmpty = new PracticeError(
  PracticeErrorCodes.NoCards,
  PracticeErrorMessages.QueueEmpty,
);

export const PracticeErrAssociationSaveFailed = new PracticeError(
  PracticeErrorCodes.AssociationSaveFailed,
  PracticeErrorMessages.AssociationSaveFailed,
);

export const PracticeErrPracticeDataFailed = new PracticeError(
  PracticeErrorCodes.NoCards,
  PracticeErrorMessages.PracticeDataFailed,
);

export const PracticeErrCaseValueEmpty = new PracticeError(
  PracticeErrorCodes.AssociationSaveFailed,
  PracticeErrorMessages.CaseValueEmpty,
);

export function practiceCardNotFoundError(message: string): PracticeError {
  return new PracticeError(PracticeErrorCodes.CardNotFound, message);
}

export function practiceAssociationNotFoundError(message: string): PracticeError {
  return new PracticeError(PracticeErrorCodes.AssociationNotFound, message);
}

export function practiceAssociationSaveFailedWithMessage(message: string): PracticeError {
  return new PracticeError(PracticeErrorCodes.AssociationSaveFailed, message);
}

export function practiceNoCardsError(message: string): PracticeError {
  return new PracticeError(PracticeErrorCodes.NoCards, message);
}

export function practiceAssociationErrorFromThrown(thrown: unknown): PracticeError {
  if (thrown instanceof Error) {
    if (thrown.message.startsWith("Record not found")) {
      return practiceCardNotFoundError(thrown.message);
    }
    if (thrown.message.startsWith("Association not found")) {
      return practiceAssociationNotFoundError(thrown.message);
    }
    return practiceAssociationSaveFailedWithMessage(thrown.message);
  }
  return PracticeErrAssociationSaveFailed;
}

export function practiceQueueErrorFromThrown(thrown: unknown): PracticeError {
  if (thrown instanceof Error) {
    if (thrown.message.startsWith("Record not found")) {
      return practiceCardNotFoundError(thrown.message);
    }
    return practiceNoCardsError(thrown.message);
  }
  return PracticeErrPracticeDataFailed;
}

export function practiceLanguageErrorFromThrown(thrown: unknown): PracticeError {
  if (thrown instanceof Error) {
    return practiceAssociationSaveFailedWithMessage(thrown.message);
  }
  return PracticeErrAssociationSaveFailed;
}

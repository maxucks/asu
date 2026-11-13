import { AppError } from "@/core/app_errors";
import {
  PracticeErrorCodes,
  PracticeErrorMessages,
  type PracticeErrorCode,
} from "@asu/contracts";

export type { PracticeErrorCode } from "@asu/contracts";

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

import { AppError } from "@/core/app_errors"

export type PracticeErrorCode =
  | "PRACTICE_NO_CARDS"
  | "PRACTICE_CARD_NOT_FOUND"
  | "PRACTICE_INVALID_GRADE"
  | "PRACTICE_ASSOCIATION_SAVE_FAILED"
  | "PRACTICE_ASSOCIATION_NOT_FOUND"

export class PracticeError extends AppError<PracticeErrorCode> {
  constructor(code: PracticeErrorCode, message: string) {
    super(code, message)
    this.name = "PracticeError"
  }
}

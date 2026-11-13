export const PracticeErrorCodes = {
  NoCards: "practice_no_cards",
  CardNotFound: "practice_card_not_found",
  InvalidGrade: "practice_invalid_grade",
  AssociationSaveFailed: "practice_association_save_failed",
  AssociationNotFound: "practice_association_not_found",
} as const

export type PracticeErrorCode = (typeof PracticeErrorCodes)[keyof typeof PracticeErrorCodes]

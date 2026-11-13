export const AssociationKinds = ["text", "image", "audio", "sketch", "video"] as const

export type AssociationKind = (typeof AssociationKinds)[number]

export type AssociationDto = {
  readonly id: string
  readonly kind: AssociationKind
  readonly contentRef: string
  readonly sortOrder: number
  readonly createdAt: string
  readonly hiddenFromPractice: boolean
}

export type CaseDto = {
  readonly id: string
  readonly languageName: string
  readonly lemmaText: string
  readonly meaning: string | null
  readonly associations: readonly AssociationDto[]
}

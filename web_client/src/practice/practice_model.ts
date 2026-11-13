import type { AssociationDto, AssociationKind } from "@asu/contracts"
import type { PracticeCardDto } from "@/practice/practice_repository"

/** Instance shape for UI, selectors, and type-only imports. */
export type PracticeAssociation = {
  readonly id: string
  readonly kind: AssociationKind
  readonly contentRef: string
  readonly sortOrder: number
  readonly createdAt: Date
  readonly hiddenFromPractice: boolean
}

export class Association implements PracticeAssociation {
  constructor(
    readonly id: string,
    readonly kind: AssociationKind,
    readonly contentRef: string,
    readonly sortOrder: number,
    readonly createdAt: Date,
    readonly hiddenFromPractice: boolean,
  ) {}

  static fromDto(dto: AssociationDto): Association {
    return new Association(
      dto.id,
      dto.kind,
      dto.contentRef,
      dto.sortOrder,
      new Date(dto.createdAt),
      dto.hiddenFromPractice,
    )
  }

  static textStub(caseId: string, text: string, sortOrder: number): Association {
    return new Association(`${caseId}-assoc-${crypto.randomUUID()}`, "text", text, sortOrder, new Date(), false)
  }

  static kindStub(caseId: string, kind: AssociationKind, sortOrder: number): Association {
    return Association.sessionCue(caseId, kind, `stub:${kind}`, sortOrder)
  }

  static sessionCue(
    caseId: string,
    kind: AssociationKind,
    contentRef: string,
    sortOrder: number,
    hiddenFromPractice = false,
  ): Association {
    return new Association(
      `${caseId}-assoc-${crypto.randomUUID()}`,
      kind,
      contentRef,
      sortOrder,
      new Date(),
      hiddenFromPractice,
    )
  }

  withContentRef(contentRef: string): Association {
    return new Association(this.id, this.kind, contentRef, this.sortOrder, this.createdAt, this.hiddenFromPractice)
  }

  withHiddenFromPractice(hiddenFromPractice: boolean): Association {
    return new Association(this.id, this.kind, this.contentRef, this.sortOrder, this.createdAt, hiddenFromPractice)
  }
}

export class PracticeCard {
  constructor(
    readonly id: string,
    readonly languageName: string,
    readonly lemmaText: string,
    readonly meaning: string | null,
    readonly associations: readonly Association[],
  ) {}

  static fromDto(dto: PracticeCardDto): PracticeCard {
    return new PracticeCard(
      dto.id,
      dto.languageName,
      dto.lemmaText,
      dto.meaning,
      dto.associations.map((item) => Association.fromDto(item)),
    )
  }
}

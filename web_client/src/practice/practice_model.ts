import type { AssociationDto, AssociationKind, CaseCategoryRefDto } from "@/core/data_sources/http_case_data_source"
import type { PracticeCardDto } from "@/practice/practice_repository"

/** Instance shape for UI, selectors, and type-only imports. */
export type PracticeAssociation = {
  readonly id: string
  readonly kind: AssociationKind
  readonly contentRef: string
  readonly tileColor: string | null
  readonly sortOrder: number
  readonly createdAt: Date
  readonly hiddenFromPractice: boolean
}

export class Association implements PracticeAssociation {
  constructor(
    readonly id: string,
    readonly kind: AssociationKind,
    readonly contentRef: string,
    readonly tileColor: string | null,
    readonly sortOrder: number,
    readonly createdAt: Date,
    readonly hiddenFromPractice: boolean,
  ) {}

  static fromDto(dto: AssociationDto): Association {
    return new Association(
      dto.id,
      dto.kind,
      dto.contentRef,
      dto.tileColor ?? null,
      dto.sortOrder,
      new Date(dto.createdAt),
      dto.hiddenFromPractice,
    )
  }

  static textStub(caseId: string, text: string, sortOrder: number): Association {
    return new Association(`${caseId}-assoc-${crypto.randomUUID()}`, "text", text, null, sortOrder, new Date(), false)
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
      null,
      sortOrder,
      new Date(),
      hiddenFromPractice,
    )
  }

  withContentRef(contentRef: string): Association {
    return new Association(this.id, this.kind, contentRef, this.tileColor, this.sortOrder, this.createdAt, this.hiddenFromPractice)
  }

  withTextDetails(contentRef: string, tileColor: string | null): Association {
    return new Association(this.id, this.kind, contentRef, tileColor, this.sortOrder, this.createdAt, this.hiddenFromPractice)
  }

  withHiddenFromPractice(hiddenFromPractice: boolean): Association {
    return new Association(this.id, this.kind, this.contentRef, this.tileColor, this.sortOrder, this.createdAt, hiddenFromPractice)
  }
}

export class PracticeCard {
  constructor(
    readonly id: string,
    readonly languageName: string,
    readonly lemmaText: string,
    readonly meaning: string | null,
    readonly associations: readonly Association[],
    readonly categories: readonly CaseCategoryRefDto[],
  ) {}

  static fromDto(dto: PracticeCardDto): PracticeCard {
    return new PracticeCard(
      dto.id,
      dto.languageName,
      dto.lemmaText,
      dto.meaning,
      dto.associations.map((item) => Association.fromDto(item)),
      dto.categories ?? [],
    )
  }
}

export function parseCaseLemma(raw: string): string | null {
  const text = raw.trim()
  return text.length > 0 ? text : null
}

export function parseCaseMeaning(raw: string): string | null {
  const text = raw.trim()
  return text.length > 0 ? text : null
}
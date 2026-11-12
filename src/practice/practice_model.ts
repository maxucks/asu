import type {
  AssociationDto,
  AssociationKind,
} from "@/core/data_sources/case_data_source";
import type { PracticeCardDto } from "@/practice/practice_repository";

export class Association {
  constructor(
    readonly id: string,
    readonly kind: AssociationKind,
    readonly contentRef: string,
    readonly sortOrder: number,
    readonly createdAt: Date,
  ) {}

  static fromDto(dto: AssociationDto): Association {
    return new Association(
      dto.id,
      dto.kind,
      dto.contentRef,
      dto.sortOrder,
      new Date(dto.createdAt),
    );
  }

  static textStub(caseId: string, text: string, sortOrder: number): Association {
    return new Association(
      `${caseId}-assoc-${crypto.randomUUID()}`,
      "text",
      text,
      sortOrder,
      new Date(),
    );
  }

  static kindStub(caseId: string, kind: AssociationKind, sortOrder: number): Association {
    return new Association(
      `${caseId}-assoc-${crypto.randomUUID()}`,
      kind,
      `stub:${kind}`,
      sortOrder,
      new Date(),
    );
  }
}

export class PracticeCard {
  constructor(
    readonly id: string,
    readonly languageName: string,
    readonly lemmaText: string,
    readonly translation: string | null,
    readonly associations: readonly Association[],
  ) {}

  static fromDto(dto: PracticeCardDto): PracticeCard {
    return new PracticeCard(
      dto.id,
      dto.languageName,
      dto.lemmaText,
      dto.translation,
      dto.associations.map((item) => Association.fromDto(item)),
    );
  }
}

import type {
  AssociationDto,
  CaseDataSource,
  CaseDto,
} from "@/core/data_sources/case_data_source";

const SEED_CASES: readonly CaseDto[] = [
  {
    id: "case-1",
    languageName: "English",
    lemmaText: "answer",
    translation: "respuesta",
    associations: [
      {
        id: "a1",
        kind: "text",
        contentRef: "\"Hello?\"",
        sortOrder: 0,
        createdAt: "2026-01-01T12:00:00.000Z",
      },
      {
        id: "a2",
        kind: "image",
        contentRef: "stub:image",
        sortOrder: 1,
        createdAt: "2026-01-01T12:01:00.000Z",
      },
    ],
  },
  {
    id: "case-2",
    languageName: "Japanese",
    lemmaText: "猫 (ねこ)",
    translation: "cat",
    associations: [
      {
        id: "b1",
        kind: "text",
        contentRef: "nya~",
        sortOrder: 0,
        createdAt: "2026-01-02T10:00:00.000Z",
      },
      {
        id: "b2",
        kind: "audio",
        contentRef: "stub:audio",
        sortOrder: 1,
        createdAt: "2026-01-02T10:01:00.000Z",
      },
      {
        id: "b3",
        kind: "sketch",
        contentRef: "stub:sketch",
        sortOrder: 2,
        createdAt: "2026-01-02T10:02:00.000Z",
      },
    ],
  },
  {
    id: "case-3",
    languageName: "German",
    lemmaText: "Entschuldigung",
    translation: "sorry / excuse me",
    associations: [
      {
        id: "c1",
        kind: "text",
        contentRef: "Oops lol",
        sortOrder: 0,
        createdAt: "2026-01-03T08:00:00.000Z",
      },
      {
        id: "c4",
        kind: "video",
        contentRef: "stub:video",
        sortOrder: 1,
        createdAt: "2026-01-03T08:01:00.000Z",
      },
    ],
  },
] as const satisfies readonly CaseDto[];

function cloneCaseDto(entry: CaseDto): CaseDto {
  return {
    ...entry,
    associations: entry.associations.map((item) => ({ ...item })),
  };
}

export class MockCaseDataSource implements CaseDataSource {
  private readonly casesById = new Map(
    SEED_CASES.map((entry) => [entry.id, cloneCaseDto(entry)]),
  );

  async getCaseDtoById(caseId: string): Promise<CaseDto> {
    const entry = this.casesById.get(caseId);
    if (!entry) {
      throw new Error(`Record not found: ${caseId}`);
    }
    return cloneCaseDto(entry);
  }

  async appendAssociationDto(
    caseId: string,
    association: AssociationDto,
  ): Promise<CaseDto> {
    const entry = this.casesById.get(caseId);
    if (!entry) {
      throw new Error(`Record not found: ${caseId}`);
    }
    const updated: CaseDto = {
      ...entry,
      associations: [...entry.associations, association],
    };
    this.casesById.set(caseId, updated);
    return cloneCaseDto(updated);
  }
}

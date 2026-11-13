import type {
  AssociationDto,
  CaseDataSource,
  CaseDto,
} from "@/core/data_sources/case_data_source";

const BASE = "2026-03-10T10:00:00.000Z";

function textAssoc(
  id: string,
  contentRef: string,
  sortOrder: number,
  hiddenFromPractice = false,
): AssociationDto {
  return {
    id,
    kind: "text",
    contentRef,
    sortOrder,
    createdAt: BASE,
    hiddenFromPractice,
  };
}

function imageAssoc(
  id: string,
  contentRef: string,
  sortOrder: number,
  hiddenFromPractice = false,
): AssociationDto {
  return {
    id,
    kind: "image",
    contentRef,
    sortOrder,
    createdAt: BASE,
    hiddenFromPractice,
  };
}

const SEED_CASES: readonly CaseDto[] = [
  {
    id: "case-1",
    languageName: "English",
    lemmaText: "reconcile",
    translation:
      "To settle a quarrel or bring opposites together again; restore friendly relations after estrangement.",
    associations: [
      textAssoc("c1-a1", "React process in Virtual DOM", 0),
    ],
  },
  {
    id: "case-2",
    languageName: "English",
    lemmaText: "lucrative",
    translation:
      "Yielding money or profit; worth doing because the payoff is large.",
    associations: [textAssoc("c2-a1", "🧅💸", 0)],
  },
  {
    id: "case-3",
    languageName: "English",
    lemmaText: "scarce",
    translation:
      "Not enough to go around; limited so it is hard to get when you need it.",
    associations: [textAssoc("c3-a1", "шрам", 0)],
  },
  {
    id: "case-4",
    languageName: "English",
    lemmaText: "grind to a halt",
    translation:
      "To slow down bit by bit and stop completely, the way stuck gears or traffic eventually freeze.",
    associations: [
      imageAssoc(
        "c4-a1",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnZ8XVttlp7b9XV_QhN4Ira1Sc7PW5KHhgq-vlaJi1HLR5dCsOURe2ZE8&s=10",
        0,
      ),
      imageAssoc(
        "c4-a2",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJob4e3NdmznUyaTNNN6w2OFYygfkOdSpZCAuJA5P9-g&s=10",
        1,
      ),
    ],
  },
  {
    id: "case-5",
    languageName: "English",
    lemmaText: "ablaze",
    translation:
      "On fire or glowing intensely; vividly lit up, as if flames or bright color pour from it.",
    associations: [
      textAssoc("c5-a1", "set on fire", 0),
      textAssoc("c5-a2", "ignite", 1),
    ],
  },
  {
    id: "case-6",
    languageName: "English",
    lemmaText: "tea (gossip)",
    translation:
      "Spicy personal talk and rumor—the social “spill,” not the cup you drink.",
    associations: [
      imageAssoc(
        "c6-a1",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjK5GZM34wNulYKRD6bax0WlSn_br27Czel9NiEJKjtw&s=10",
        0,
      ),
    ],
  },
  {
    id: "case-7",
    languageName: "English",
    lemmaText: "maw",
    translation:
      "The great gripping jaws or throat of a beast; any hungry, swallowing mouth of a hole.",
    associations: [textAssoc("c7-a1", "мяу", 0)],
  },
  {
    id: "case-8",
    languageName: "English",
    lemmaText: "froth",
    translation:
      "The airy foam that rides on top of liquid, often when it has been shaken or boiled up.",
    associations: [
      textAssoc("c8-a1", "F", 0),
      textAssoc("c8-a2", "Рот", 1),
    ],
  },
  {
    id: "case-9",
    languageName: "English",
    lemmaText: "frothing at the maw",
    translation:
      "Raging with foam at the mouth; furious, out of control, like a mad dog snapping.",
    associations: [
      textAssoc("c9-a1", "F", 0),
      textAssoc("c9-a2", "Рот", 1),
      textAssoc("c9-a3", "мяу", 2),
    ],
  },
  {
    id: "case-10",
    languageName: "English",
    lemmaText: "verge",
    translation:
      "The rim where one thing ends and another almost begins; the brink of a change.",
    associations: [textAssoc("c10-a1", "merge", 0)],
  },
  {
    id: "case-11",
    languageName: "English",
    lemmaText: "vice",
    translation:
      "A moral weakness or corrupting habit that pulls you toward wrong again and again.",
    associations: [
      textAssoc(
        "c11-a1",
        "all the Eden's ... running through my head",
        0,
      ),
    ],
  },
  {
    id: "case-12",
    languageName: "English",
    lemmaText: "cut someone some slack",
    translation:
      "To ease up on blame or pressure; give a person room to breathe instead of demanding perfection.",
    associations: [
      imageAssoc(
        "c12-a1",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDH8qHUs-pxGpmXkZfLRhDyqshwfRFoTsuEbXVN5iHG5V--ibz3fEpul0&s=10",
        0,
      ),
    ],
  },
  {
    id: "case-13",
    languageName: "English",
    lemmaText: "be lenient on someone",
    translation:
      "To judge or punish gently; let someone off more lightly than the rules might allow.",
    associations: [textAssoc("c13-a1", "Лена", 0)],
  },
  {
    id: "case-14",
    languageName: "English",
    lemmaText: "mortify (mortified)",
    translation:
      "To wound someone's pride so deeply they want to sink through the floor; humiliate utterly.",
    associations: [
      imageAssoc(
        "c14-a1",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6J-pKTmYXfAKrjn7BIoeoc_jubOPgr7C98Nvm2qZp6A&s=10",
        0,
      ),
    ],
  },
] as const satisfies readonly CaseDto[];

function cloneCaseDto(entry: CaseDto): CaseDto {
  return {
    ...entry,
    associations: entry.associations.map((item) => ({ ...item })),
  };
}

function mapAssociation(
  entry: CaseDto,
  associationId: string,
  map: (item: AssociationDto) => AssociationDto,
): CaseDto {
  const index = entry.associations.findIndex((item) => item.id === associationId);
  if (index === -1) {
    throw new Error(`Association not found: ${associationId}`);
  }
  const associations = entry.associations.map((item, itemIndex) =>
    itemIndex === index ? map(item) : item,
  );
  return { ...entry, associations };
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

  async updateAssociationContentRefDto(
    caseId: string,
    associationId: string,
    contentRef: string,
  ): Promise<CaseDto> {
    const entry = this.casesById.get(caseId);
    if (!entry) {
      throw new Error(`Record not found: ${caseId}`);
    }
    const updated = mapAssociation(entry, associationId, (item) => ({
      ...item,
      contentRef,
    }));
    this.casesById.set(caseId, updated);
    return cloneCaseDto(updated);
  }

  async updateAssociationHiddenFromPracticeDto(
    caseId: string,
    associationId: string,
    hiddenFromPractice: boolean,
  ): Promise<CaseDto> {
    const entry = this.casesById.get(caseId);
    if (!entry) {
      throw new Error(`Record not found: ${caseId}`);
    }
    const updated = mapAssociation(entry, associationId, (item) => ({
      ...item,
      hiddenFromPractice,
    }));
    this.casesById.set(caseId, updated);
    return cloneCaseDto(updated);
  }

  async deleteAssociationDto(
    caseId: string,
    associationId: string,
  ): Promise<CaseDto> {
    const entry = this.casesById.get(caseId);
    if (!entry) {
      throw new Error(`Record not found: ${caseId}`);
    }
    const exists = entry.associations.some((item) => item.id === associationId);
    if (!exists) {
      throw new Error(`Association not found: ${associationId}`);
    }
    const updated: CaseDto = {
      ...entry,
      associations: entry.associations.filter((item) => item.id !== associationId),
    };
    this.casesById.set(caseId, updated);
    return cloneCaseDto(updated);
  }
}

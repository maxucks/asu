import type { AssociationDto, CaseDto } from "@/core/data_sources/case_data_source_drizzle"
import type { StudyRecordDto } from "@/core/data_sources/study_record_data_source_drizzle"
import { db, databasePath } from "@/core/db"
import { log } from "@/core/logger"
import { associations, cases, languages, studyRecords } from "@/db/schema"

const BASE = "2026-03-10T10:00:00.000Z";

function textAssoc(
  id: string,
  contentRef: string,
  sortOrder: number,
  hiddenFromPractice = false,
  tileColor: string | null = "honey",
): AssociationDto {
  return {
    id,
    kind: "text",
    contentRef,
    tileColor,
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
    tileColor: null,
    sortOrder,
    createdAt: BASE,
    hiddenFromPractice,
  };
}

const SEED_CASES_RAW = [
  {
    id: "case-1",
    languageName: "English",
    value: "reconcile",
    meaning:
      "To settle a quarrel or bring opposites together again; restore friendly relations after estrangement.",
    associations: [
      textAssoc("c1-a1", "React process in Virtual DOM", 0),
    ],
  },
  {
    id: "case-2",
    languageName: "English",
    value: "lucrative",
    meaning:
      "Yielding money or profit; worth doing because the payoff is large.",
    associations: [textAssoc("c2-a1", "🧅💸", 0)],
  },
  {
    id: "case-3",
    languageName: "English",
    value: "scarce",
    meaning:
      "Not enough to go around; limited so it is hard to get when you need it.",
    associations: [textAssoc("c3-a1", "шрам", 0)],
  },
  {
    id: "case-4",
    languageName: "English",
    value: "grind to a halt",
    meaning:
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
    value: "ablaze",
    meaning:
      "On fire or glowing intensely; vividly lit up, as if flames or bright color pour from it.",
    associations: [
      textAssoc("c5-a1", "set on fire", 0),
      textAssoc("c5-a2", "ignite", 1),
    ],
  },
  {
    id: "case-6",
    languageName: "English",
    value: "tea (gossip)",
    meaning:
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
    value: "maw",
    meaning:
      "The great gripping jaws or throat of a beast; any hungry, swallowing mouth of a hole.",
    associations: [textAssoc("c7-a1", "мяу", 0)],
  },
  {
    id: "case-8",
    languageName: "English",
    value: "froth",
    meaning:
      "The airy foam that rides on top of liquid, often when it has been shaken or boiled up.",
    associations: [
      textAssoc("c8-a1", "F", 0),
      textAssoc("c8-a2", "Рот", 1),
    ],
  },
  {
    id: "case-9",
    languageName: "English",
    value: "frothing at the maw",
    meaning:
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
    value: "verge",
    meaning:
      "The rim where one thing ends and another almost begins; the brink of a change.",
    associations: [textAssoc("c10-a1", "merge", 0)],
  },
  {
    id: "case-11",
    languageName: "English",
    value: "vice",
    meaning:
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
    value: "cut someone some slack",
    meaning:
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
    value: "be lenient on someone",
    meaning:
      "To judge or punish gently; let someone off more lightly than the rules might allow.",
    associations: [textAssoc("c13-a1", "Лена", 0)],
  },
  {
    id: "case-14",
    languageName: "English",
    value: "mortify (mortified)",
    meaning:
      "To wound someone's pride so deeply they want to sink through the floor; humiliate utterly.",
    associations: [
      imageAssoc(
        "c14-a1",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6J-pKTmYXfAKrjn7BIoeoc_jubOPgr7C98Nvm2qZp6A&s=10",
        0,
      ),
    ],
  },
] as const satisfies readonly Omit<CaseDto, "categories">[]

const SEED_CASES: readonly CaseDto[] = SEED_CASES_RAW.map((item) => ({
  ...item,
  categories: [],
}))

const SEED_STUDY_RECORDS: readonly StudyRecordDto[] = [
  {
    caseId: "case-1",
    reviewStatus: "repeating",
    dueAt: "2026-03-10T09:00:00.000Z",
    schedulingStrengthNumeric: 3,
    repetitionsCount: 5,
    lastRepetitionAt: "2026-03-08T09:00:00.000Z",
    lastGradeNumeric: 1,
  },
  {
    caseId: "case-2",
    reviewStatus: "learning",
    dueAt: "2026-03-10T09:05:00.000Z",
    schedulingStrengthNumeric: 0,
    repetitionsCount: 1,
    lastRepetitionAt: "2026-03-10T08:55:00.000Z",
    lastGradeNumeric: 1,
  },
  {
    caseId: "case-3",
    reviewStatus: "learning",
    dueAt: "2026-03-10T09:10:00.000Z",
    schedulingStrengthNumeric: 0,
    repetitionsCount: 1,
    lastRepetitionAt: "2026-03-10T09:00:00.000Z",
    lastGradeNumeric: 2,
  },
  ...["case-4", "case-5", "case-6", "case-7", "case-8", "case-9", "case-10", "case-11", "case-12", "case-13", "case-14"].map(
    (caseId): StudyRecordDto => ({
      caseId,
      reviewStatus: "new",
      dueAt: null,
      schedulingStrengthNumeric: 0,
      repetitionsCount: 0,
      lastRepetitionAt: null,
      lastGradeNumeric: null,
    }),
  ),
]

const DEFAULT_LANGUAGE_ID = "lang-english"

async function seed() {
  log.info("seeding database", { database: databasePath(), cases: SEED_CASES.length })

  await db.delete(studyRecords)
  await db.delete(associations)
  await db.delete(cases)
  await db.delete(languages)

  await db.insert(languages).values({ id: DEFAULT_LANGUAGE_ID, name: "English", icon: "🇬🇧" })

  for (const entry of SEED_CASES) {
    await insertCase(entry)
  }

  for (const record of SEED_STUDY_RECORDS) {
    await db.insert(studyRecords).values({
      caseId: record.caseId,
      reviewStatus: record.reviewStatus,
      dueAt: record.dueAt,
      schedulingStrengthNumeric: record.schedulingStrengthNumeric,
      repetitionsCount: record.repetitionsCount,
      lastRepetitionAt: record.lastRepetitionAt,
      lastGradeNumeric: record.lastGradeNumeric,
    })
  }

  log.info("seed complete", { studyRecords: SEED_STUDY_RECORDS.length })
}

async function insertCase(entry: CaseDto) {
  await db.insert(cases).values({
    id: entry.id,
    languageId: DEFAULT_LANGUAGE_ID,
    value: entry.value,
    meaning: entry.meaning,
  })

  for (const item of entry.associations) {
    await db.insert(associations).values({
      id: item.id,
      caseId: entry.id,
      kind: item.kind,
      contentRef: item.contentRef,
      tileColor: item.tileColor,
      sortOrder: item.sortOrder,
      createdAt: item.createdAt,
      hiddenFromPractice: item.hiddenFromPractice,
    })
  }
}

await seed()

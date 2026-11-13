import type { AssociationDto, CaseDto } from "./case"
import type { StudyRecordDto } from "./study_record"

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

export const SEED_CASES: readonly CaseDto[] = [
  {
    id: "case-1",
    languageName: "English",
    lemmaText: "reconcile",
    meaning:
      "To settle a quarrel or bring opposites together again; restore friendly relations after estrangement.",
    associations: [
      textAssoc("c1-a1", "React process in Virtual DOM", 0),
    ],
  },
  {
    id: "case-2",
    languageName: "English",
    lemmaText: "lucrative",
    meaning:
      "Yielding money or profit; worth doing because the payoff is large.",
    associations: [textAssoc("c2-a1", "🧅💸", 0)],
  },
  {
    id: "case-3",
    languageName: "English",
    lemmaText: "scarce",
    meaning:
      "Not enough to go around; limited so it is hard to get when you need it.",
    associations: [textAssoc("c3-a1", "шрам", 0)],
  },
  {
    id: "case-4",
    languageName: "English",
    lemmaText: "grind to a halt",
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
    lemmaText: "ablaze",
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
    lemmaText: "tea (gossip)",
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
    lemmaText: "maw",
    meaning:
      "The great gripping jaws or throat of a beast; any hungry, swallowing mouth of a hole.",
    associations: [textAssoc("c7-a1", "мяу", 0)],
  },
  {
    id: "case-8",
    languageName: "English",
    lemmaText: "froth",
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
    lemmaText: "frothing at the maw",
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
    lemmaText: "verge",
    meaning:
      "The rim where one thing ends and another almost begins; the brink of a change.",
    associations: [textAssoc("c10-a1", "merge", 0)],
  },
  {
    id: "case-11",
    languageName: "English",
    lemmaText: "vice",
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
    lemmaText: "cut someone some slack",
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
    lemmaText: "be lenient on someone",
    meaning:
      "To judge or punish gently; let someone off more lightly than the rules might allow.",
    associations: [textAssoc("c13-a1", "Лена", 0)],
  },
  {
    id: "case-14",
    languageName: "English",
    lemmaText: "mortify (mortified)",
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
] as const satisfies readonly CaseDto[]

export const SEED_STUDY_RECORDS: readonly StudyRecordDto[] = [
  { caseId: "case-1", reviewStatus: "repeating", dueAt: "2026-03-10T09:00:00.000Z" },
  { caseId: "case-2", reviewStatus: "learning", dueAt: "2026-03-10T09:05:00.000Z" },
  { caseId: "case-3", reviewStatus: "learning", dueAt: "2026-03-10T09:10:00.000Z" },
  { caseId: "case-4", reviewStatus: "new", dueAt: null },
  { caseId: "case-5", reviewStatus: "new", dueAt: null },
  { caseId: "case-6", reviewStatus: "new", dueAt: null },
  { caseId: "case-7", reviewStatus: "new", dueAt: null },
  { caseId: "case-8", reviewStatus: "new", dueAt: null },
  { caseId: "case-9", reviewStatus: "new", dueAt: null },
  { caseId: "case-10", reviewStatus: "new", dueAt: null },
  { caseId: "case-11", reviewStatus: "new", dueAt: null },
  { caseId: "case-12", reviewStatus: "new", dueAt: null },
  { caseId: "case-13", reviewStatus: "new", dueAt: null },
  { caseId: "case-14", reviewStatus: "new", dueAt: null },
] as const satisfies readonly StudyRecordDto[]

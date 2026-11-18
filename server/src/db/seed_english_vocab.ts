import { eq } from "drizzle-orm"
import { db, databasePath } from "@/core/db"
import { cases, languages, studyRecords } from "@/db/schema"
import { log } from "@/core/logger"
import { ENGLISH_VOCAB_CASE_LINES } from "@/db/seed_data/english_vocab_cases"
import { parseSeedCaseLines } from "@/db/seed_data/parse_seed_case_line"
import { createInitialStudyRecord } from "@/practice/practice_srs"

export const ENGLISH_LANGUAGE_ID = "lang-english"

const CASE_ID_PREFIX = "case-en-vocab-"

async function ensureEnglishLanguage() {
  const existing = await db.select().from(languages).where(eq(languages.id, ENGLISH_LANGUAGE_ID)).limit(1)
  if (existing.length > 0) return

  await db.insert(languages).values({
    id: ENGLISH_LANGUAGE_ID,
    name: "English",
    icon: "🇬🇧",
  })
}

async function seedEnglishVocab() {
  const parsed = parseSeedCaseLines(ENGLISH_VOCAB_CASE_LINES)
  log.info("seeding english vocabulary cases", {
    database: databasePath(),
    lines: parsed.length,
  })

  await ensureEnglishLanguage()

  let inserted = 0
  let updated = 0

  for (let i = 0; i < parsed.length; i++) {
    const { lemmaText, meaning } = parsed[i]
    const id = `${CASE_ID_PREFIX}${String(i + 1).padStart(3, "0")}`

    const existing = await db.select({ id: cases.id }).from(cases).where(eq(cases.id, id)).limit(1)
    if (existing.length > 0) {
      await db
        .update(cases)
        .set({ lemmaText, meaning, languageId: ENGLISH_LANGUAGE_ID })
        .where(eq(cases.id, id))
      updated++
      continue
    }

    await db.insert(cases).values({
      id,
      languageId: ENGLISH_LANGUAGE_ID,
      lemmaText,
      meaning,
    })

    const study = createInitialStudyRecord(id)
    await db.insert(studyRecords).values({
      caseId: study.caseId,
      levelNumeric: study.levelNumeric,
      pointsNumeric: study.pointsNumeric,
      studyMode: study.studyMode,
      lockedUntil: study.lockedUntil,
      modeUntil: study.modeUntil,
      streakCount: study.streakCount,
    })

    inserted++
  }

  log.info("english vocabulary seed complete", { inserted, updated, total: parsed.length })
}

await seedEnglishVocab()
import { eq } from "drizzle-orm"
import { db, databasePath } from "@/core/db"
import { cases, languages, studyRecords } from "@/db/schema"
import { log } from "@/core/logger"
import { parseJapaneseCaseLines } from "@/db/seed_data/parse_japanese_case_line"
import { JAPANESE_SPATIAL_CASE_LINES } from "@/db/seed_data/japanese_spatial_cases"

export const JAPANESE_LANGUAGE_ID = "lang-japanese"

const CASE_ID_PREFIX = "case-ja-spatial-"

async function ensureJapaneseLanguage() {
  const existing = await db.select().from(languages).where(eq(languages.id, JAPANESE_LANGUAGE_ID)).limit(1)
  if (existing.length > 0) return

  await db.insert(languages).values({
    id: JAPANESE_LANGUAGE_ID,
    name: "Japanese",
    icon: "🇯🇵",
  })
}

async function seedJapaneseSpatial() {
  const parsed = parseJapaneseCaseLines(JAPANESE_SPATIAL_CASE_LINES)
  log.info("seeding japanese spatial cases", {
    database: databasePath(),
    lines: parsed.length,
  })

  await ensureJapaneseLanguage()

  let inserted = 0
  let updated = 0

  for (let i = 0; i < parsed.length; i++) {
    const { value, meaning } = parsed[i]
    const id = `${CASE_ID_PREFIX}${String(i + 1).padStart(3, "0")}`

    const existing = await db.select({ id: cases.id }).from(cases).where(eq(cases.id, id)).limit(1)
    if (existing.length > 0) {
      await db
        .update(cases)
        .set({ value, meaning, languageId: JAPANESE_LANGUAGE_ID })
        .where(eq(cases.id, id))
      updated++
      continue
    }

    await db.insert(cases).values({
      id,
      languageId: JAPANESE_LANGUAGE_ID,
      value,
      meaning,
    })

    await db.insert(studyRecords).values({
      caseId: id,
      reviewStatus: "new",
      dueAt: null,
      schedulingStrengthNumeric: 0,
      repetitionsCount: 0,
      lastRepetitionAt: null,
      lastGradeNumeric: null,
    })

    inserted++
  }

  log.info("japanese spatial seed complete", { inserted, updated, total: parsed.length })
}

await seedJapaneseSpatial()
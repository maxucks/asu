import type { CaseDto } from "@asu/contracts"
import { SEED_CASES, SEED_STUDY_RECORDS } from "@asu/contracts/dev-seed"
import { db, databasePath } from "@/core/db"
import { log } from "@/core/logger"
import { associations, cases, languages, studyRecords } from "@/db/schema"

const DEFAULT_LANGUAGE_ID = "lang-english"

async function seed() {
  log.info("seeding database", { database: databasePath(), cases: SEED_CASES.length })

  await db.delete(studyRecords)
  await db.delete(associations)
  await db.delete(cases)
  await db.delete(languages)

  await db.insert(languages).values({ id: DEFAULT_LANGUAGE_ID, name: "English" })

  for (const entry of SEED_CASES) {
    await insertCase(entry)
  }

  for (const record of SEED_STUDY_RECORDS) {
    await db.insert(studyRecords).values({
      caseId: record.caseId,
      reviewStatus: record.reviewStatus,
      dueAt: record.dueAt,
    })
  }

  log.info("seed complete", { studyRecords: SEED_STUDY_RECORDS.length })
}

async function insertCase(entry: CaseDto) {
  await db.insert(cases).values({
    id: entry.id,
    languageId: DEFAULT_LANGUAGE_ID,
    lemmaText: entry.lemmaText,
    meaning: entry.meaning,
  })

  for (const item of entry.associations) {
    await db.insert(associations).values({
      id: item.id,
      caseId: entry.id,
      kind: item.kind,
      contentRef: item.contentRef,
      sortOrder: item.sortOrder,
      createdAt: item.createdAt,
      hiddenFromPractice: item.hiddenFromPractice,
    })
  }
}

await seed()

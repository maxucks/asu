import { asc, count, eq } from "drizzle-orm"
import { db } from "@/core/db"
import { cases, languages } from "@/db/schema"

export const DEFAULT_LANGUAGE_ID = "lang-english"

export type LanguageDto = {
  readonly id: string
  readonly name: string
  readonly icon: string
  readonly caseCount: number
}

export class DrizzleLanguageDataSource {
  async listLanguageDtos(): Promise<readonly LanguageDto[]> {
    const rows = await db
      .select({
        id: languages.id,
        name: languages.name,
        icon: languages.icon,
        caseCount: count(cases.id),
      })
      .from(languages)
      .leftJoin(cases, eq(cases.languageId, languages.id))
      .groupBy(languages.id, languages.name, languages.icon)
      .orderBy(asc(languages.name))

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      icon: row.icon,
      caseCount: Number(row.caseCount),
    }))
  }
}
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

  async getLanguageDtoById(languageId: string): Promise<LanguageDto> {
    const rows = await db
      .select({
        id: languages.id,
        name: languages.name,
        icon: languages.icon,
        caseCount: count(cases.id),
      })
      .from(languages)
      .leftJoin(cases, eq(cases.languageId, languages.id))
      .where(eq(languages.id, languageId))
      .groupBy(languages.id, languages.name, languages.icon)
      .limit(1)

    const row = rows[0]
    if (!row) {
      throw new Error(`Language not found: ${languageId}`)
    }

    return {
      id: row.id,
      name: row.name,
      icon: row.icon,
      caseCount: Number(row.caseCount),
    }
  }

  async createLanguageDto(name: string, icon: string): Promise<LanguageDto> {
    const id = `lang-${crypto.randomUUID()}`
    await db.insert(languages).values({ id, name, icon })
    return this.getLanguageDtoById(id)
  }

  async updateLanguageDto(
    languageId: string,
    patch: { readonly name?: string; readonly icon?: string },
  ): Promise<LanguageDto> {
    const updates: { name?: string; icon?: string } = {}
    if (patch.name !== undefined) updates.name = patch.name
    if (patch.icon !== undefined) updates.icon = patch.icon

    if (Object.keys(updates).length > 0) {
      const updated = await db.update(languages).set(updates).where(eq(languages.id, languageId)).returning({ id: languages.id })
      if (updated.length === 0) {
        throw new Error(`Language not found: ${languageId}`)
      }
    }

    return this.getLanguageDtoById(languageId)
  }

  async deleteLanguageDto(languageId: string): Promise<void> {
    const lang = await this.getLanguageDtoById(languageId)
    if (lang.caseCount > 0) {
      throw new Error(`Language has cases: ${languageId}`)
    }

    const deleted = await db.delete(languages).where(eq(languages.id, languageId)).returning({ id: languages.id })
    if (deleted.length === 0) {
      throw new Error(`Language not found: ${languageId}`)
    }
  }
}
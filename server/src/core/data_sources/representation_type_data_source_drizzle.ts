import { asc, eq, isNull, or } from "drizzle-orm"
import { db } from "@/core/db"
import { representationTypes } from "@/db/schema"

export type RepresentationTypeDto = {
  readonly id: number
  readonly name: string
  readonly languageId: string | null
}

export class DrizzleRepresentationTypeDataSource {
  async listForLanguageId(languageId: string): Promise<readonly RepresentationTypeDto[]> {
    const rows = await db
      .select({
        id: representationTypes.id,
        name: representationTypes.name,
        languageId: representationTypes.languageId,
      })
      .from(representationTypes)
      .where(or(isNull(representationTypes.languageId), eq(representationTypes.languageId, languageId)))
      .orderBy(asc(representationTypes.id))

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      languageId: row.languageId,
    }))
  }

  async isTypeAllowedForLanguage(typeId: number, languageId: string): Promise<boolean> {
    const rows = await db
      .select({ languageId: representationTypes.languageId })
      .from(representationTypes)
      .where(eq(representationTypes.id, typeId))
      .limit(1)

    const scope = rows[0]?.languageId
    if (rows[0] === undefined) return false
    return scope === null || scope === languageId
  }
}
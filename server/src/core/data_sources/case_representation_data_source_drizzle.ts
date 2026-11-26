import { and, asc, eq, inArray } from "drizzle-orm"
import { newEntityId } from "@/core/entity_id"
import type { DrizzleRepresentationTypeDataSource } from "@/core/data_sources/representation_type_data_source_drizzle"
import { db } from "@/core/db"
import { caseRepresentations, representationTypes } from "@/db/schema"

export type CaseRepresentationDto = {
  readonly id: string
  readonly representationTypeId: number
  readonly representationTypeName: string
  readonly value: string
}

export type CaseRepresentationWrite = {
  readonly representationTypeId: number
  readonly value: string | null
}

export class DrizzleCaseRepresentationDataSource {
  constructor(private readonly representationTypeDataSource: DrizzleRepresentationTypeDataSource) {}

  async listForCaseId(caseId: string): Promise<readonly CaseRepresentationDto[]> {
    const rows = await db
      .select({
        id: caseRepresentations.id,
        representationTypeId: caseRepresentations.representationTypeId,
        representationTypeName: representationTypes.name,
        value: caseRepresentations.value,
      })
      .from(caseRepresentations)
      .innerJoin(representationTypes, eq(caseRepresentations.representationTypeId, representationTypes.id))
      .where(eq(caseRepresentations.caseId, caseId))
      .orderBy(asc(caseRepresentations.representationTypeId))

    return rows.map((row) => ({
      id: row.id,
      representationTypeId: row.representationTypeId,
      representationTypeName: row.representationTypeName,
      value: row.value,
    }))
  }

  async listForCaseIds(caseIds: readonly string[]): Promise<Map<string, readonly CaseRepresentationDto[]>> {
    const map = new Map<string, CaseRepresentationDto[]>()
    if (caseIds.length === 0) return map

    const rows = await db
      .select({
        caseId: caseRepresentations.caseId,
        id: caseRepresentations.id,
        representationTypeId: caseRepresentations.representationTypeId,
        representationTypeName: representationTypes.name,
        value: caseRepresentations.value,
      })
      .from(caseRepresentations)
      .innerJoin(representationTypes, eq(caseRepresentations.representationTypeId, representationTypes.id))
      .where(inArray(caseRepresentations.caseId, [...caseIds]))
      .orderBy(asc(caseRepresentations.representationTypeId))

    for (const row of rows) {
      const item: CaseRepresentationDto = {
        id: row.id,
        representationTypeId: row.representationTypeId,
        representationTypeName: row.representationTypeName,
        value: row.value,
      }
      const list = map.get(row.caseId) ?? []
      list.push(item)
      map.set(row.caseId, list)
    }
    return map
  }

  async syncForCase(caseId: string, languageId: string, writes: readonly CaseRepresentationWrite[]): Promise<void> {
    for (const write of writes) {
      const allowed = await this.representationTypeDataSource.isTypeAllowedForLanguage(
        write.representationTypeId,
        languageId,
      )
      if (!allowed) {
        throw new Error(`Representation type not allowed for this language: ${write.representationTypeId}`)
      }

      const existing = await db
        .select({ id: caseRepresentations.id })
        .from(caseRepresentations)
        .where(
          and(
            eq(caseRepresentations.caseId, caseId),
            eq(caseRepresentations.representationTypeId, write.representationTypeId),
          ),
        )
        .limit(1)

      const rowId = existing[0]?.id
      const trimmed = write.value?.trim() ?? ""

      if (trimmed.length === 0) {
        if (rowId) {
          await db.delete(caseRepresentations).where(eq(caseRepresentations.id, rowId))
        }
        continue
      }

      if (rowId) {
        await db.update(caseRepresentations).set({ value: trimmed }).where(eq(caseRepresentations.id, rowId))
      } else {
        await db.insert(caseRepresentations).values({
          id: newEntityId(),
          caseId,
          representationTypeId: write.representationTypeId,
          value: trimmed,
        })
      }
    }
  }
}
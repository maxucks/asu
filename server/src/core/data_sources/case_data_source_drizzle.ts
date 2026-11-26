import { DEFAULT_LANGUAGE_ID } from "@/core/data_sources/language_data_source_drizzle"
import { newEntityId } from "@/core/entity_id"
import { asc, eq } from "drizzle-orm"

export const AssociationKinds = ["text", "image", "audio", "sketch", "video"] as const

export type AssociationKind = (typeof AssociationKinds)[number]

export type AssociationDto = {
  readonly id: string
  readonly kind: AssociationKind
  readonly contentRef: string
  readonly tileColor: string | null
  readonly sortOrder: number
  readonly createdAt: string
  readonly hiddenFromPractice: boolean
}

export type CaseCategoryRefDto = {
  readonly id: string
  readonly name: string
}

export type CaseNoteRefDto = {
  readonly id: string
  readonly name: string
  readonly content: string
}

export type CaseDto = {
  readonly id: string
  readonly languageName: string
  readonly value: string
  readonly meaning: string | null
  readonly associations: readonly AssociationDto[]
  readonly categories: readonly CaseCategoryRefDto[]
  readonly representations: readonly CaseRepresentationDto[]
  readonly notes: readonly CaseNoteRefDto[]
}
import type {
  CaseRepresentationDto,
  CaseRepresentationWrite,
  DrizzleCaseRepresentationDataSource,
} from "@/core/data_sources/case_representation_data_source_drizzle"
import type { DrizzleCategoryDataSource } from "@/core/data_sources/category_data_source_drizzle"
import type { DrizzleNoteDataSource } from "@/core/data_sources/note_data_source_drizzle"
import { db } from "@/core/db"
import { associations, cases, languages } from "@/db/schema"

export type { CaseRepresentationDto } from "@/core/data_sources/case_representation_data_source_drizzle"
function mapAssociationRow(row: typeof associations.$inferSelect): AssociationDto {
  return {
    id: row.id,
    kind: row.kind as AssociationKind,
    contentRef: row.contentRef,
    tileColor: row.tileColor ?? null,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
    hiddenFromPractice: row.hiddenFromPractice,
  }
}

export class DrizzleCaseDataSource {
  constructor(
    private readonly categoryDataSource: DrizzleCategoryDataSource,
    private readonly caseRepresentationDataSource: DrizzleCaseRepresentationDataSource,
    private readonly noteDataSource: DrizzleNoteDataSource,
  ) {}

  private async loadCaseDto(
    caseId: string,
    representations?: readonly CaseRepresentationDto[],
    noteRefs?: readonly CaseNoteRefDto[],
  ): Promise<CaseDto> {
  const rows = await db
    .select({
      caseId: cases.id,
      value: cases.value,
      meaning: cases.meaning,
      languageName: languages.name,
    })
    .from(cases)
    .innerJoin(languages, eq(cases.languageId, languages.id))
    .where(eq(cases.id, caseId))
    .limit(1)

  const base = rows[0]
  if (!base) {
    throw new Error(`Record not found: ${caseId}`)
  }

  const assocRows = await db
    .select()
    .from(associations)
    .where(eq(associations.caseId, caseId))
    .orderBy(asc(associations.sortOrder))

  const categoryMap = await this.categoryDataSource.listCategoryRefsByCaseIds([base.caseId])
  const reps =
    representations ?? (await this.caseRepresentationDataSource.listForCaseId(caseId))
  const noteList =
    noteRefs ??
    (await this.noteDataSource.listNoteRefsByCaseIds([caseId])).get(caseId) ??
    []

  return {
    id: base.caseId,
    languageName: base.languageName,
    value: base.value,
    meaning: base.meaning,
    associations: assocRows.map(mapAssociationRow),
    categories: categoryMap.get(base.caseId) ?? [],
    representations: reps,
    notes: noteList,
  }
  }

  async listCaseDtosByLanguageId(languageId: string): Promise<readonly CaseDto[]> {
    const rows = await db
      .select({ id: cases.id })
      .from(cases)
      .where(eq(cases.languageId, languageId))
      .orderBy(asc(cases.value))

    const caseIds = rows.map((row) => row.id)
    const repMap = await this.caseRepresentationDataSource.listForCaseIds(caseIds)
    const noteMap = await this.noteDataSource.listNoteRefsByCaseIds(caseIds)

    const loaded: CaseDto[] = []
    for (const row of rows) {
      loaded.push(await this.loadCaseDto(row.id, repMap.get(row.id) ?? [], noteMap.get(row.id) ?? []))
    }
    return loaded
  }

  async createCaseDto(
    value: string,
    meaning: string | null,
    languageId: string = DEFAULT_LANGUAGE_ID,
    representations?: readonly CaseRepresentationWrite[],
  ): Promise<CaseDto> {
    const id = newEntityId()
    await db.insert(cases).values({
      id,
      languageId,
      value,
      meaning,
    })
    if (representations && representations.length > 0) {
      await this.caseRepresentationDataSource.syncForCase(id, languageId, representations)
    }
    return this.loadCaseDto(id)
  }

  async updateCaseDto(
    caseId: string,
    patch: {
      readonly value?: string
      readonly meaning?: string | null
      readonly representations?: readonly CaseRepresentationWrite[]
    },
  ): Promise<CaseDto> {
    const existing = await db
      .select({ languageId: cases.languageId })
      .from(cases)
      .where(eq(cases.id, caseId))
      .limit(1)

    const languageId = existing[0]?.languageId
    if (!languageId) {
      throw new Error(`Record not found: ${caseId}`)
    }

    const updates: { value?: string; meaning?: string | null } = {}
    if (patch.value !== undefined) updates.value = patch.value
    if (patch.meaning !== undefined) updates.meaning = patch.meaning

    if (Object.keys(updates).length > 0) {
      const updated = await db.update(cases).set(updates).where(eq(cases.id, caseId)).returning({ id: cases.id })
      if (updated.length === 0) {
        throw new Error(`Record not found: ${caseId}`)
      }
    }

    if (patch.representations) {
      await this.caseRepresentationDataSource.syncForCase(caseId, languageId, patch.representations)
    }

    return this.loadCaseDto(caseId)
  }

  async deleteCaseDto(caseId: string): Promise<void> {
    const existing = await db.select({ languageId: cases.languageId }).from(cases).where(eq(cases.id, caseId)).limit(1)
    const languageId = existing[0]?.languageId

    const deleted = await db.delete(cases).where(eq(cases.id, caseId)).returning({ id: cases.id })
    if (deleted.length === 0) {
      throw new Error(`Record not found: ${caseId}`)
    }

    if (languageId) {
      await this.categoryDataSource.pruneEmptyCategoriesForLanguage(languageId)
    }
  }

  async getCaseDtoById(caseId: string): Promise<CaseDto> {
    return this.loadCaseDto(caseId)
  }

  async appendAssociationDto(caseId: string, association: AssociationDto): Promise<CaseDto> {
    await db.insert(associations).values({
      id: association.id,
      caseId,
      kind: association.kind,
      contentRef: association.contentRef,
      tileColor: association.tileColor,
      sortOrder: association.sortOrder,
      createdAt: association.createdAt,
      hiddenFromPractice: association.hiddenFromPractice,
    })
    return this.loadCaseDto(caseId)
  }

  async updateTextAssociationDto(
    caseId: string,
    associationId: string,
    patch: { readonly text: string; readonly tileColor: string | null },
  ): Promise<CaseDto> {
    const updated = await db
      .update(associations)
      .set({ contentRef: patch.text, tileColor: patch.tileColor })
      .where(eq(associations.id, associationId))
      .returning({ id: associations.id })

    if (updated.length === 0) {
      throw new Error(`Association not found: ${associationId}`)
    }

    return this.loadCaseDto(caseId)
  }

  async updateImageAssociationContentRefDto(
    caseId: string,
    associationId: string,
    url: string,
  ): Promise<CaseDto> {
    return this.setAssociationContentRef(caseId, associationId, url)
  }

  private async setAssociationContentRef(
    caseId: string,
    associationId: string,
    contentRef: string,
  ): Promise<CaseDto> {
    const updated = await db
      .update(associations)
      .set({ contentRef })
      .where(eq(associations.id, associationId))
      .returning({ id: associations.id })

    if (updated.length === 0) {
      throw new Error(`Association not found: ${associationId}`)
    }

    return this.loadCaseDto(caseId)
  }

  async updateAssociationHiddenFromPracticeDto(
    caseId: string,
    associationId: string,
    hiddenFromPractice: boolean,
  ): Promise<CaseDto> {
    const updated = await db
      .update(associations)
      .set({ hiddenFromPractice })
      .where(eq(associations.id, associationId))
      .returning({ id: associations.id })

    if (updated.length === 0) {
      throw new Error(`Association not found: ${associationId}`)
    }

    return this.loadCaseDto(caseId)
  }

  async reorderAssociationsDto(caseId: string, associationIds: readonly string[]): Promise<CaseDto> {
    const assocRows = await db
      .select({ id: associations.id })
      .from(associations)
      .where(eq(associations.caseId, caseId))

    const existingIds = new Set(assocRows.map((row) => row.id))
    if (associationIds.length !== existingIds.size) {
      throw new Error("Association order invalid")
    }
    for (const id of associationIds) {
      if (!existingIds.has(id)) {
        throw new Error("Association order invalid")
      }
    }

    for (let index = 0; index < associationIds.length; index += 1) {
      const associationId = associationIds[index]!
      await db.update(associations).set({ sortOrder: index }).where(eq(associations.id, associationId))
    }

    return this.loadCaseDto(caseId)
  }

  async deleteAssociationDto(caseId: string, associationId: string): Promise<CaseDto> {
    const deleted = await db
      .delete(associations)
      .where(eq(associations.id, associationId))
      .returning({ id: associations.id })

    if (deleted.length === 0) {
      throw new Error(`Association not found: ${associationId}`)
    }

    return this.loadCaseDto(caseId)
  }
}

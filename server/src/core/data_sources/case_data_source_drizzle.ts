import { DEFAULT_LANGUAGE_ID } from "@/core/data_sources/language_data_source_drizzle"
import { asc, eq } from "drizzle-orm"

export const AssociationKinds = ["text", "image", "audio", "sketch", "video"] as const

export type AssociationKind = (typeof AssociationKinds)[number]

export type AssociationDto = {
  readonly id: string
  readonly kind: AssociationKind
  readonly contentRef: string
  readonly sortOrder: number
  readonly createdAt: string
  readonly hiddenFromPractice: boolean
}

export type CaseDto = {
  readonly id: string
  readonly languageName: string
  readonly lemmaText: string
  readonly meaning: string | null
  readonly associations: readonly AssociationDto[]
}
import { db } from "@/core/db"
import { associations, cases, languages } from "@/db/schema"
function mapAssociationRow(row: typeof associations.$inferSelect): AssociationDto {
  return {
    id: row.id,
    kind: row.kind as AssociationKind,
    contentRef: row.contentRef,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
    hiddenFromPractice: row.hiddenFromPractice,
  }
}

async function loadCaseDto(caseId: string): Promise<CaseDto> {
  const rows = await db
    .select({
      caseId: cases.id,
      lemmaText: cases.lemmaText,
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

  return {
    id: base.caseId,
    languageName: base.languageName,
    lemmaText: base.lemmaText,
    meaning: base.meaning,
    associations: assocRows.map(mapAssociationRow),
  }
}

export class DrizzleCaseDataSource {
  async listCaseDtosByLanguageId(languageId: string): Promise<readonly CaseDto[]> {
    const rows = await db
      .select({ id: cases.id })
      .from(cases)
      .where(eq(cases.languageId, languageId))
      .orderBy(asc(cases.lemmaText))

    const loaded: CaseDto[] = []
    for (const row of rows) {
      loaded.push(await loadCaseDto(row.id))
    }
    return loaded
  }

  async createCaseDto(lemmaText: string, meaning: string | null, languageId: string = DEFAULT_LANGUAGE_ID): Promise<CaseDto> {
    const id = `case-${crypto.randomUUID()}`
    await db.insert(cases).values({
      id,
      languageId,
      lemmaText,
      meaning,
    })
    return loadCaseDto(id)
  }

  async updateCaseDto(
    caseId: string,
    patch: { readonly lemmaText?: string; readonly meaning?: string | null },
  ): Promise<CaseDto> {
    const updates: { lemmaText?: string; meaning?: string | null } = {}
    if (patch.lemmaText !== undefined) updates.lemmaText = patch.lemmaText
    if (patch.meaning !== undefined) updates.meaning = patch.meaning

    if (Object.keys(updates).length > 0) {
      const updated = await db.update(cases).set(updates).where(eq(cases.id, caseId)).returning({ id: cases.id })
      if (updated.length === 0) {
        throw new Error(`Record not found: ${caseId}`)
      }
    }

    return loadCaseDto(caseId)
  }

  async deleteCaseDto(caseId: string): Promise<void> {
    const deleted = await db.delete(cases).where(eq(cases.id, caseId)).returning({ id: cases.id })
    if (deleted.length === 0) {
      throw new Error(`Record not found: ${caseId}`)
    }
  }

  async getCaseDtoById(caseId: string): Promise<CaseDto> {
    return loadCaseDto(caseId)
  }

  async appendAssociationDto(caseId: string, association: AssociationDto): Promise<CaseDto> {
    await db.insert(associations).values({
      id: association.id,
      caseId,
      kind: association.kind,
      contentRef: association.contentRef,
      sortOrder: association.sortOrder,
      createdAt: association.createdAt,
      hiddenFromPractice: association.hiddenFromPractice,
    })
    return loadCaseDto(caseId)
  }

  async updateTextAssociationContentRefDto(
    caseId: string,
    associationId: string,
    text: string,
  ): Promise<CaseDto> {
    return this.setAssociationContentRef(caseId, associationId, text)
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

    return loadCaseDto(caseId)
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

    return loadCaseDto(caseId)
  }

  async deleteAssociationDto(caseId: string, associationId: string): Promise<CaseDto> {
    const deleted = await db
      .delete(associations)
      .where(eq(associations.id, associationId))
      .returning({ id: associations.id })

    if (deleted.length === 0) {
      throw new Error(`Association not found: ${associationId}`)
    }

    return loadCaseDto(caseId)
  }
}

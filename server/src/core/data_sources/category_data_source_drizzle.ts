import { newEntityId } from "@/core/entity_id"
import { db } from "@/core/db"
import { caseCategories, cases, categories } from "@/db/schema"
import { and, asc, count, eq, inArray } from "drizzle-orm"

export type CategoryDto = {
  readonly id: string
  readonly name: string
  readonly caseCount: number
}

export type CaseCategoryRefDto = {
  readonly id: string
  readonly name: string
}

export function normalizeCategoryName(raw: string): string {
  return raw.trim().replace(/\s+/g, " ")
}

export class DrizzleCategoryDataSource {
  async listCategoryDtos(languageId: string): Promise<readonly CategoryDto[]> {
    const rows = await db
      .select({
        id: categories.id,
        name: categories.name,
        caseCount: count(caseCategories.caseId),
      })
      .from(categories)
      .leftJoin(caseCategories, eq(caseCategories.categoryId, categories.id))
      .where(eq(categories.languageId, languageId))
      .groupBy(categories.id, categories.name)
      .orderBy(asc(categories.name))

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      caseCount: Number(row.caseCount),
    }))
  }

  async createCategoryDto(languageId: string, rawName: string): Promise<CategoryDto> {
    const name = normalizeCategoryName(rawName)
    if (name.length === 0) {
      throw new Error("Category name cannot be empty.")
    }

    const existing = await db
      .select({ id: categories.id, name: categories.name })
      .from(categories)
      .where(and(eq(categories.languageId, languageId), eq(categories.name, name)))
      .limit(1)

    const found = existing[0]
    if (found) {
      const listed = await this.listCategoryDtos(languageId)
      const dto = listed.find((item) => item.id === found.id)
      if (dto) return dto
    }

    const id = newEntityId()
    await db.insert(categories).values({ id, languageId, name })

    const counts = await this.listCategoryDtos(languageId)
    const created = counts.find((item) => item.id === id)
    if (!created) {
      return { id, name, caseCount: 0 }
    }
    return created
  }

  async listCaseIdsForCategory(categoryId: string): Promise<readonly string[]> {
    const rows = await db
      .select({ caseId: caseCategories.caseId })
      .from(caseCategories)
      .where(eq(caseCategories.categoryId, categoryId))
    return rows.map((row) => row.caseId)
  }

  async listCategoryRefsByCaseIds(caseIds: readonly string[]): Promise<Map<string, readonly CaseCategoryRefDto[]>> {
    const map = new Map<string, readonly CaseCategoryRefDto[]>()
    if (caseIds.length === 0) return map

    const rows = await db
      .select({
        caseId: caseCategories.caseId,
        id: categories.id,
        name: categories.name,
      })
      .from(caseCategories)
      .innerJoin(categories, eq(caseCategories.categoryId, categories.id))
      .where(inArray(caseCategories.caseId, [...caseIds]))
      .orderBy(asc(categories.name))

    const grouped = new Map<string, CaseCategoryRefDto[]>()
    for (const row of rows) {
      const list = grouped.get(row.caseId) ?? []
      list.push({ id: row.id, name: row.name })
      grouped.set(row.caseId, list)
    }

    for (const caseId of caseIds) {
      map.set(caseId, grouped.get(caseId) ?? [])
    }

    return map
  }

  async setCaseCategoryIds(caseId: string, categoryIds: readonly string[]): Promise<void> {
    const caseRows = await db.select({ languageId: cases.languageId }).from(cases).where(eq(cases.id, caseId)).limit(1)
    const languageId = caseRows[0]?.languageId
    if (!languageId) {
      throw new Error(`Record not found: ${caseId}`)
    }

    if (categoryIds.length > 0) {
      const valid = await db
        .select({ id: categories.id })
        .from(categories)
        .where(and(eq(categories.languageId, languageId), inArray(categories.id, [...categoryIds])))

      if (valid.length !== categoryIds.length) {
        throw new Error("Category not found for this language.")
      }
    }

    await db.delete(caseCategories).where(eq(caseCategories.caseId, caseId))

    for (const categoryId of categoryIds) {
      await db.insert(caseCategories).values({ caseId, categoryId })
    }

    await this.pruneEmptyCategoriesForLanguage(languageId)
  }

  async pruneEmptyCategoriesForLanguage(languageId: string): Promise<void> {
    const catRows = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.languageId, languageId))

    for (const { id } of catRows) {
      const linked = await db
        .select({ caseId: caseCategories.caseId })
        .from(caseCategories)
        .where(eq(caseCategories.categoryId, id))
        .limit(1)
      if (linked.length === 0) {
        await db.delete(categories).where(eq(categories.id, id))
      }
    }
  }

  async getCaseLanguageId(caseId: string): Promise<string | null> {
    const rows = await db.select({ languageId: cases.languageId }).from(cases).where(eq(cases.id, caseId)).limit(1)
    return rows[0]?.languageId ?? null
  }

  async getCategoryLanguageId(categoryId: string): Promise<string | null> {
    const rows = await db.select({ languageId: categories.languageId }).from(categories).where(eq(categories.id, categoryId)).limit(1)
    return rows[0]?.languageId ?? null
  }
}
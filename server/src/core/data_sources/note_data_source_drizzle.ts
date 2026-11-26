import { newEntityId } from "@/core/entity_id"
import { db } from "@/core/db"
import { caseNotes, cases, notes } from "@/db/schema"
import { and, asc, count, eq, inArray } from "drizzle-orm"

export type CaseNoteRefDto = {
  readonly id: string
  readonly name: string
  readonly content: string
}

export type NoteDto = {
  readonly id: string
  readonly name: string
  readonly content: string
  readonly caseCount: number
}

export function normalizeNoteName(raw: string): string {
  return raw.trim().replace(/\s+/g, " ")
}

export function normalizeNoteContent(raw: string): string {
  return raw.trim()
}

export class DrizzleNoteDataSource {
  async listNoteDtos(languageId: string): Promise<readonly NoteDto[]> {
    const rows = await db
      .select({
        id: notes.id,
        name: notes.name,
        content: notes.content,
        caseCount: count(caseNotes.caseId),
      })
      .from(notes)
      .leftJoin(caseNotes, eq(caseNotes.noteId, notes.id))
      .where(eq(notes.languageId, languageId))
      .groupBy(notes.id, notes.name, notes.content)
      .orderBy(asc(notes.name))

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      content: row.content,
      caseCount: Number(row.caseCount),
    }))
  }

  async getNoteDto(noteId: string): Promise<NoteDto> {
    const rows = await db
      .select({
        id: notes.id,
        name: notes.name,
        content: notes.content,
        caseCount: count(caseNotes.caseId),
      })
      .from(notes)
      .leftJoin(caseNotes, eq(caseNotes.noteId, notes.id))
      .where(eq(notes.id, noteId))
      .groupBy(notes.id, notes.name, notes.content)
      .limit(1)

    const row = rows[0]
    if (!row) {
      throw new Error(`Record not found: ${noteId}`)
    }

    return {
      id: row.id,
      name: row.name,
      content: row.content,
      caseCount: Number(row.caseCount),
    }
  }

  async createNoteDto(languageId: string, rawName: string, rawContent: string): Promise<NoteDto> {
    const name = normalizeNoteName(rawName)
    const content = normalizeNoteContent(rawContent)
    if (name.length === 0) {
      throw new Error("Note name cannot be empty.")
    }
    if (content.length === 0) {
      throw new Error("Note content cannot be empty.")
    }

    const id = newEntityId()
    await db.insert(notes).values({ id, languageId, name, content })
    return { id, name, content, caseCount: 0 }
  }

  async updateNoteDto(
    noteId: string,
    patch: { readonly name?: string; readonly content?: string },
  ): Promise<NoteDto> {
    const existing = await db.select().from(notes).where(eq(notes.id, noteId)).limit(1)
    if (!existing[0]) {
      throw new Error(`Record not found: ${noteId}`)
    }

    const updates: { name?: string; content?: string } = {}
    if (patch.name !== undefined) {
      const name = normalizeNoteName(patch.name)
      if (name.length === 0) {
        throw new Error("Note name cannot be empty.")
      }
      updates.name = name
    }
    if (patch.content !== undefined) {
      const content = normalizeNoteContent(patch.content)
      if (content.length === 0) {
        throw new Error("Note content cannot be empty.")
      }
      updates.content = content
    }

    if (Object.keys(updates).length > 0) {
      await db.update(notes).set(updates).where(eq(notes.id, noteId))
    }

    return this.getNoteDto(noteId)
  }

  async deleteNoteDto(noteId: string): Promise<void> {
    const deleted = await db.delete(notes).where(eq(notes.id, noteId)).returning({ id: notes.id })
    if (deleted.length === 0) {
      throw new Error(`Record not found: ${noteId}`)
    }
  }

  async listNoteRefsByCaseIds(caseIds: readonly string[]): Promise<Map<string, readonly CaseNoteRefDto[]>> {
    const map = new Map<string, readonly CaseNoteRefDto[]>()
    if (caseIds.length === 0) return map

    const rows = await db
      .select({
        caseId: caseNotes.caseId,
        id: notes.id,
        name: notes.name,
        content: notes.content,
      })
      .from(caseNotes)
      .innerJoin(notes, eq(caseNotes.noteId, notes.id))
      .where(inArray(caseNotes.caseId, [...caseIds]))
      .orderBy(asc(notes.name))

    const grouped = new Map<string, CaseNoteRefDto[]>()
    for (const row of rows) {
      const list = grouped.get(row.caseId) ?? []
      list.push({ id: row.id, name: row.name, content: row.content })
      grouped.set(row.caseId, list)
    }

    for (const caseId of caseIds) {
      map.set(caseId, grouped.get(caseId) ?? [])
    }

    return map
  }

  async attachNoteToCase(caseId: string, noteId: string): Promise<void> {
    const caseRow = await db.select({ languageId: cases.languageId }).from(cases).where(eq(cases.id, caseId)).limit(1)
    const caseLanguageId = caseRow[0]?.languageId
    if (!caseLanguageId) {
      throw new Error(`Record not found: ${caseId}`)
    }

    const noteRow = await db
      .select({ languageId: notes.languageId })
      .from(notes)
      .where(eq(notes.id, noteId))
      .limit(1)
    const noteLanguageId = noteRow[0]?.languageId
    if (!noteLanguageId) {
      throw new Error(`Record not found: ${noteId}`)
    }

    if (caseLanguageId !== noteLanguageId) {
      throw new Error("Note does not belong to the same language as this entry.")
    }

    const linked = await db
      .select({ caseId: caseNotes.caseId })
      .from(caseNotes)
      .where(and(eq(caseNotes.caseId, caseId), eq(caseNotes.noteId, noteId)))
      .limit(1)
    if (linked[0]) return

    await db.insert(caseNotes).values({ caseId, noteId })
  }

  async detachNoteFromCase(caseId: string, noteId: string): Promise<void> {
    const deleted = await db
      .delete(caseNotes)
      .where(and(eq(caseNotes.caseId, caseId), eq(caseNotes.noteId, noteId)))
      .returning({ caseId: caseNotes.caseId })
    if (deleted.length === 0) {
      throw new Error(`Note is not attached to this entry.`)
    }
  }

  async listAttachedNoteIds(caseId: string): Promise<readonly string[]> {
    const rows = await db
      .select({ noteId: caseNotes.noteId })
      .from(caseNotes)
      .where(eq(caseNotes.caseId, caseId))
    return rows.map((row) => row.noteId)
  }
}
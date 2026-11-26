import { asuApiBaseUrl, requestJson } from "@/core/utils/request_json"
import type { PracticeCardDto } from "@/core/data_sources/http_case_data_source"

export type NoteDto = {
  readonly id: string
  readonly name: string
  readonly content: string
  readonly caseCount: number
}

type NotesResponse = {
  readonly notes: readonly NoteDto[]
}

export class HttpNoteDataSource {
  constructor(
    private readonly queueCardsById: Map<string, PracticeCardDto>,
    private readonly baseUrl: string = asuApiBaseUrl(),
  ) {}

  async listNotes(languageId: string): Promise<readonly NoteDto[]> {
    const body = await requestJson<NotesResponse>(
      this.baseUrl,
      "GET",
      `/api/practice/notes?languageId=${encodeURIComponent(languageId)}`,
    )
    return body.notes
  }

  async createNote(languageId: string, name: string, content: string): Promise<NoteDto> {
    return requestJson<NoteDto>(this.baseUrl, "POST", "/api/practice/notes", { languageId, name, content })
  }

  async updateNote(noteId: string, patch: { name?: string; content?: string }): Promise<NoteDto> {
    return requestJson<NoteDto>(this.baseUrl, "PATCH", `/api/practice/notes/${noteId}`, patch)
  }

  async deleteNote(noteId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/practice/notes/${noteId}`, { method: "DELETE" })
    if (!response.ok) {
      let message = `Request failed (${response.status})`
      try {
        const payload = (await response.json()) as { message?: string }
        if (typeof payload.message === "string" && payload.message.length > 0) {
          message = payload.message
        }
      } catch {
        // empty body
      }
      throw new Error(message)
    }
  }

  async linkNoteToCase(
    caseId: string,
    link: { readonly noteId: string } | { readonly name: string; readonly content: string },
  ): Promise<PracticeCardDto> {
    const card = await requestJson<PracticeCardDto>(
      this.baseUrl,
      "POST",
      `/api/practice/cases/${caseId}/notes`,
      link,
    )
    this.queueCardsById.set(card.id, card)
    return card
  }

  async unlinkNoteFromCase(caseId: string, noteId: string): Promise<PracticeCardDto> {
    const card = await requestJson<PracticeCardDto>(
      this.baseUrl,
      "DELETE",
      `/api/practice/cases/${caseId}/notes/${noteId}`,
    )
    this.queueCardsById.set(card.id, card)
    return card
  }
}
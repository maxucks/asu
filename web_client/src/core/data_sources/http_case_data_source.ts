import { asuApiBaseUrl, requestJson } from "@/core/utils/request_json"

export const AssociationKinds = ["text", "image", "audio", "sketch", "video"] as const

export type AssociationKind = (typeof AssociationKinds)[number]

export type CaseCategoryRefDto = {
  readonly id: string
  readonly name: string
}

export type AssociationDto = {
  readonly id: string
  readonly kind: AssociationKind
  readonly contentRef: string
  readonly tileColor: string | null
  readonly sortOrder: number
  readonly createdAt: string
  readonly hiddenFromPractice: boolean
}

/** API `/api/practice` card response body. */
export type PracticeCardDto = {
  readonly id: string
  readonly languageName: string
  readonly lemmaText: string
  readonly meaning: string | null
  readonly associations: readonly AssociationDto[]
  readonly categories: readonly CaseCategoryRefDto[]
}

export type CaseDto = PracticeCardDto

export type PracticeQueueDto = {
  readonly cards: readonly PracticeCardDto[]
}

export type PracticeSessionDto = {
  readonly totalCases: number
  readonly card: PracticeCardDto
}

export class HttpCaseDataSource {
  constructor(
    private readonly queueCardsById: Map<string, PracticeCardDto>,
    private readonly baseUrl: string = asuApiBaseUrl(),
  ) {}

  private categoryQuery(categoryId: string | null): string {
    return categoryId ? `&categoryId=${encodeURIComponent(categoryId)}` : ""
  }

  async fetchCasesByLanguageId(languageId: string, categoryId: string | null = null): Promise<PracticeQueueDto> {
    const listing = await requestJson<PracticeQueueDto>(
      this.baseUrl,
      "GET",
      `/api/practice/cases?languageId=${encodeURIComponent(languageId)}${this.categoryQuery(categoryId)}`,
    )
    for (const card of listing.cards) {
      this.queueCardsById.set(card.id, card)
    }
    return listing
  }

  async fetchPracticeSession(languageId: string, categoryId: string | null = null): Promise<PracticeSessionDto> {
    const session = await requestJson<PracticeSessionDto>(
      this.baseUrl,
      "GET",
      `/api/practice/session?languageId=${encodeURIComponent(languageId)}${this.categoryQuery(categoryId)}`,
    )
    this.queueCardsById.set(session.card.id, session.card)
    return session
  }

  async pickNextPracticeCard(
    languageId: string,
    excludeCaseId: string | null,
    categoryId: string | null = null,
  ): Promise<PracticeSessionDto> {
    const exclude = excludeCaseId ? `&excludeCaseId=${encodeURIComponent(excludeCaseId)}` : ""
    const session = await requestJson<PracticeSessionDto>(
      this.baseUrl,
      "GET",
      `/api/practice/next?languageId=${encodeURIComponent(languageId)}${exclude}${this.categoryQuery(categoryId)}`,
    )
    this.queueCardsById.set(session.card.id, session.card)
    return session
  }

  async fetchPracticeQueue(languageId: string): Promise<PracticeQueueDto> {
    const queue = await requestJson<PracticeQueueDto>(
      this.baseUrl,
      "GET",
      `/api/practice/queue?languageId=${encodeURIComponent(languageId)}`,
    )
    this.queueCardsById.clear()
    for (const card of queue.cards) {
      this.queueCardsById.set(card.id, card)
    }
    return queue
  }

  async createCaseDto(languageId: string, lemmaText: string, meaning: string | null): Promise<CaseDto> {
    return this.postCard("/api/practice/cases", { languageId, lemmaText, meaning })
  }

  async updateCaseDto(
    caseId: string,
    patch: { readonly lemmaText?: string; readonly meaning?: string | null },
  ): Promise<CaseDto> {
    return this.patchCard(`/api/practice/cases/${caseId}`, { ...patch })
  }

  async deleteCaseDto(caseId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/practice/cases/${caseId}`, { method: "DELETE" })
    if (!response.ok) {
      let message = `Request failed (${response.status})`
      try {
        const payload = (await response.json()) as { message?: string }
        if (typeof payload.message === "string" && payload.message.length > 0) {
          message = payload.message
        }
      } catch {
        // empty body on some errors
      }
      throw new Error(message)
    }
    this.queueCardsById.delete(caseId)
  }

  async getCaseDtoById(caseId: string): Promise<CaseDto> {
    const card = this.queueCardsById.get(caseId)
    if (!card) {
      throw new Error(`Record not found: ${caseId}`)
    }
    return card
  }

  async appendAssociationDto(caseId: string, association: AssociationDto): Promise<CaseDto> {
    if (association.kind === "text") {
      return this.postCard(`/api/practice/cases/${caseId}/associations/text`, {
        text: association.contentRef,
        tileColor: association.tileColor ?? undefined,
      })
    }
    if (association.kind === "image") {
      return this.postCard(`/api/practice/cases/${caseId}/associations/image-url`, {
        url: association.contentRef,
      })
    }
    throw new Error(`Unsupported association kind for API: ${association.kind}`)
  }

  async updateTextAssociationDto(
    caseId: string,
    associationId: string,
    text: string,
    tileColor: string | null,
  ): Promise<CaseDto> {
    return this.patchCard(`/api/practice/cases/${caseId}/associations/${associationId}/text`, {
      text,
      tileColor: tileColor ?? undefined,
    })
  }

  async updateImageAssociationContentRefDto(
    caseId: string,
    associationId: string,
    url: string,
  ): Promise<CaseDto> {
    return this.patchCard(
      `/api/practice/cases/${caseId}/associations/${associationId}/image-url`,
      { url },
    )
  }

  async updateAssociationHiddenFromPracticeDto(
    caseId: string,
    associationId: string,
    hiddenFromPractice: boolean,
  ): Promise<CaseDto> {
    return this.patchCard(
      `/api/practice/cases/${caseId}/associations/${associationId}/hidden`,
      { hiddenFromPractice },
    )
  }

  async submitGradeDto(caseId: string, grade: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/practice/cases/${caseId}/grade`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grade }),
    })
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

  async setCaseCategoriesDto(caseId: string, categoryIds: readonly string[]): Promise<CaseDto> {
    return this.patchCard(`/api/practice/cases/${caseId}/categories`, { categoryIds: [...categoryIds] })
  }

  async reorderAssociationsDto(caseId: string, associationIds: readonly string[]): Promise<CaseDto> {
    return this.patchCard(`/api/practice/cases/${caseId}/associations/order`, {
      associationIds: [...associationIds],
    })
  }

  async deleteAssociationDto(caseId: string, associationId: string): Promise<CaseDto> {
    const card = await requestJson<PracticeCardDto>(
      this.baseUrl,
      "DELETE",
      `/api/practice/cases/${caseId}/associations/${associationId}`,
    )
    this.queueCardsById.set(card.id, card)
    return card
  }

  private async postCard(path: string, body: Record<string, unknown>): Promise<CaseDto> {
    const card = await requestJson<PracticeCardDto>(this.baseUrl, "POST", path, body)
    this.queueCardsById.set(card.id, card)
    return card
  }

  private async patchCard(path: string, body: Record<string, unknown>): Promise<CaseDto> {
    const card = await requestJson<PracticeCardDto>(this.baseUrl, "PATCH", path, body)
    this.queueCardsById.set(card.id, card)
    return card
  }
}

import { asuApiBaseUrl, requestJson } from "@/core/utils/request_json"

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

/** API `/api/practice` card response body. */
export type PracticeCardDto = {
  readonly id: string
  readonly languageName: string
  readonly lemmaText: string
  readonly meaning: string | null
  readonly associations: readonly AssociationDto[]
}

export type CaseDto = PracticeCardDto

export type PracticeQueueDto = {
  readonly cards: readonly PracticeCardDto[]
}

export class HttpCaseDataSource {
  constructor(
    private readonly queueCardsById: Map<string, PracticeCardDto>,
    private readonly baseUrl: string = asuApiBaseUrl(),
  ) {}

  async fetchPracticeQueue(): Promise<PracticeQueueDto> {
    const queue = await requestJson<PracticeQueueDto>(this.baseUrl, "GET", "/api/practice/queue")
    this.queueCardsById.clear()
    for (const card of queue.cards) {
      this.queueCardsById.set(card.id, card)
    }
    return queue
  }

  async createCaseDto(lemmaText: string, meaning: string | null): Promise<CaseDto> {
    return this.postCard("/api/practice/cases", { lemmaText, meaning })
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
      return this.postCard(`/api/practice/cases/${caseId}/associations/text`, { text: association.contentRef })
    }
    if (association.kind === "image") {
      return this.postCard(`/api/practice/cases/${caseId}/associations/image-url`, {
        url: association.contentRef,
      })
    }
    throw new Error(`Unsupported association kind for API: ${association.kind}`)
  }

  async updateTextAssociationContentRefDto(
    caseId: string,
    associationId: string,
    text: string,
  ): Promise<CaseDto> {
    return this.patchCard(
      `/api/practice/cases/${caseId}/associations/${associationId}/text`,
      { text },
    )
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

import type { AssociationDto, CaseDto, PracticeCardDto } from "@asu/contracts"
import { asuApiBaseUrl, requestJson } from "@/core/utils/request_json"

export class HttpCaseDataSource {
  constructor(
    private readonly queueCardsById: Map<string, PracticeCardDto>,
    private readonly baseUrl: string = asuApiBaseUrl(),
  ) {}

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

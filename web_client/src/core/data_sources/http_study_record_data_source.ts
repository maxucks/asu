import type { PracticeCardDto, PracticeQueueDto, StudyRecordDto } from "@asu/contracts"
import { asuApiBaseUrl, requestJson } from "@/core/utils/request_json"

export class HttpStudyRecordDataSource {
  constructor(
    private readonly queueCardsById: Map<string, PracticeCardDto>,
    private readonly baseUrl: string = asuApiBaseUrl(),
  ) {}

  async listDueStudyRecordDtos(): Promise<readonly StudyRecordDto[]> {
    const queue = await requestJson<PracticeQueueDto>(this.baseUrl, "GET", "/api/practice/queue")
    this.queueCardsById.clear()
    for (const card of queue.cards) {
      this.queueCardsById.set(card.id, card)
    }
    return queue.cards.map((card) => ({
      caseId: card.id,
      reviewStatus: "repeating",
      dueAt: null,
    }))
  }
}

import { err, ok } from "@/core/app_errors"
import type { Result } from "@/core/app_errors"
import { DrizzleCaseDataSource } from "@/core/data_sources/case_data_source_drizzle"
import { DrizzleStudyRecordDataSource } from "@/core/data_sources/study_record_data_source_drizzle"
import type {
  AssociationDto,
  CaseDto,
} from "@/core/data_sources/case_data_source_drizzle"

export type PracticeCardDto = {
  readonly id: string
  readonly languageName: string
  readonly lemmaText: string
  readonly meaning: string | null
  readonly associations: readonly AssociationDto[]
}

export type PracticeQueueDto = {
  readonly cards: readonly PracticeCardDto[]
}

export const PracticeGrades = ["hard", "medium", "easy"] as const

export type PracticeGradeDto = (typeof PracticeGrades)[number]

import {
  practiceAssociationErrorFromThrown,
  PracticeErrAssociationNotOnCard,
  PracticeErrAssociationWrongKind,
  PracticeErrQueueEmpty,
  practiceCardNotFoundError,
  practiceQueueErrorFromThrown,
  type PracticeError,
} from "@/practice/practice_errors"

export class PracticeRepository {
  constructor(
    private readonly studyRecordDataSource: DrizzleStudyRecordDataSource,
    private readonly caseDataSource: DrizzleCaseDataSource,
  ) {}

  async appendTextAssociation(
    caseId: string,
    text: string,
  ): Promise<Result<PracticeCardDto, PracticeError>> {
    try {
      const existing = await this.caseDataSource.getCaseDtoById(caseId)
      const association: AssociationDto = {
        id: `assoc-${crypto.randomUUID()}`,
        kind: "text",
        contentRef: text,
        sortOrder: existing.associations.length,
        createdAt: new Date().toISOString(),
        hiddenFromPractice: false,
      }
      const caseDto = await this.caseDataSource.appendAssociationDto(caseId, association)
      return ok(PracticeRepository.caseDtoToPracticeCard(caseDto))
    } catch (thrown) {
      return err(practiceAssociationErrorFromThrown(thrown))
    }
  }

  async appendImageAssociation(
    caseId: string,
    url: string,
  ): Promise<Result<PracticeCardDto, PracticeError>> {
    try {
      const existing = await this.caseDataSource.getCaseDtoById(caseId)
      const association: AssociationDto = {
        id: `assoc-${crypto.randomUUID()}`,
        kind: "image",
        contentRef: url,
        sortOrder: existing.associations.length,
        createdAt: new Date().toISOString(),
        hiddenFromPractice: false,
      }
      const caseDto = await this.caseDataSource.appendAssociationDto(caseId, association)
      return ok(PracticeRepository.caseDtoToPracticeCard(caseDto))
    } catch (thrown) {
      return err(practiceAssociationErrorFromThrown(thrown))
    }
  }

  async updateTextAssociation(
    caseId: string,
    associationId: string,
    text: string,
  ): Promise<Result<PracticeCardDto, PracticeError>> {
    try {
      const existing = await this.caseDataSource.getCaseDtoById(caseId)
      const target = existing.associations.find((item) => item.id === associationId)
      if (!target) {
        return err(PracticeErrAssociationNotOnCard)
      }
      if (target.kind !== "text") {
        return err(PracticeErrAssociationWrongKind)
      }

      const caseDto = await this.caseDataSource.updateTextAssociationContentRefDto(
        caseId,
        associationId,
        text,
      )
      return ok(PracticeRepository.caseDtoToPracticeCard(caseDto))
    } catch (thrown) {
      return err(practiceAssociationErrorFromThrown(thrown))
    }
  }

  async updateImageAssociation(
    caseId: string,
    associationId: string,
    url: string,
  ): Promise<Result<PracticeCardDto, PracticeError>> {
    try {
      const existing = await this.caseDataSource.getCaseDtoById(caseId)
      const target = existing.associations.find((item) => item.id === associationId)
      if (!target) {
        return err(PracticeErrAssociationNotOnCard)
      }
      if (target.kind !== "image") {
        return err(PracticeErrAssociationWrongKind)
      }

      const caseDto = await this.caseDataSource.updateImageAssociationContentRefDto(
        caseId,
        associationId,
        url,
      )
      return ok(PracticeRepository.caseDtoToPracticeCard(caseDto))
    } catch (thrown) {
      return err(practiceAssociationErrorFromThrown(thrown))
    }
  }

  async setAssociationHiddenFromPractice(
    caseId: string,
    associationId: string,
    hiddenFromPractice: boolean,
  ): Promise<Result<PracticeCardDto, PracticeError>> {
    try {
      const caseDto = await this.caseDataSource.updateAssociationHiddenFromPracticeDto(
        caseId,
        associationId,
        hiddenFromPractice,
      )
      return ok(PracticeRepository.caseDtoToPracticeCard(caseDto))
    } catch (thrown) {
      return err(practiceAssociationErrorFromThrown(thrown))
    }
  }

  async deleteAssociation(
    caseId: string,
    associationId: string,
  ): Promise<Result<PracticeCardDto, PracticeError>> {
    try {
      const caseDto = await this.caseDataSource.deleteAssociationDto(caseId, associationId)
      return ok(PracticeRepository.caseDtoToPracticeCard(caseDto))
    } catch (thrown) {
      return err(practiceAssociationErrorFromThrown(thrown))
    }
  }

  async getQueue(): Promise<Result<PracticeQueueDto, PracticeError>> {
    try {
      const allCases = await this.caseDataSource.listAllCaseDtos()
      if (allCases.length === 0) {
        return err(PracticeErrQueueEmpty)
      }

      const shuffled = PracticeRepository.shuffle([...allCases])
      const cards = shuffled.map((caseDto) => PracticeRepository.caseDtoToPracticeCard(caseDto))
      return ok({ cards })
    } catch (thrown) {
      return err(practiceQueueErrorFromThrown(thrown))
    }
  }

  async createCase(
    lemmaText: string,
    meaning: string | null,
  ): Promise<Result<PracticeCardDto, PracticeError>> {
    try {
      const caseDto = await this.caseDataSource.createCaseDto(lemmaText, meaning)
      return ok(PracticeRepository.caseDtoToPracticeCard(caseDto))
    } catch (thrown) {
      return err(practiceQueueErrorFromThrown(thrown))
    }
  }

  async updateCase(
    caseId: string,
    patch: { readonly lemmaText?: string; readonly meaning?: string | null },
  ): Promise<Result<PracticeCardDto, PracticeError>> {
    try {
      const caseDto = await this.caseDataSource.updateCaseDto(caseId, patch)
      return ok(PracticeRepository.caseDtoToPracticeCard(caseDto))
    } catch (thrown) {
      if (thrown instanceof Error && thrown.message.startsWith("Record not found")) {
        return err(practiceCardNotFoundError(thrown.message))
      }
      return err(practiceQueueErrorFromThrown(thrown))
    }
  }

  async deleteCase(caseId: string): Promise<Result<void, PracticeError>> {
    try {
      await this.caseDataSource.deleteCaseDto(caseId)
      return ok(undefined)
    } catch (thrown) {
      if (thrown instanceof Error && thrown.message.startsWith("Record not found")) {
        return err(practiceCardNotFoundError(thrown.message))
      }
      return err(practiceQueueErrorFromThrown(thrown))
    }
  }

  private static shuffle<T>(items: T[]): T[] {
    const copy = [...items]
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1))
      ;[copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]]
    }
    return copy
  }

  private static caseDtoToPracticeCard(caseDto: CaseDto): PracticeCardDto {
    return {
      id: caseDto.id,
      languageName: caseDto.languageName,
      lemmaText: caseDto.lemmaText,
      meaning: caseDto.meaning,
      associations: caseDto.associations,
    }
  }

}

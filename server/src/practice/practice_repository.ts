import { err, ok } from "@/core/app_errors"
import type { Result } from "@/core/app_errors"
import { DrizzleCaseDataSource } from "@/core/data_sources/case_data_source_drizzle"
import { DrizzleStudyRecordDataSource } from "@/core/data_sources/study_record_data_source_drizzle"
import type { AssociationDto, CaseDto, PracticeCardDto, PracticeQueueDto } from "@asu/contracts"
import {
  practiceAssociationErrorFromThrown,
  PracticeErrAssociationNotOnCard,
  PracticeErrAssociationWrongKind,
  PracticeErrQueueEmpty,
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
      const dueRecords = await this.studyRecordDataSource.listDueStudyRecordDtos()

      if (dueRecords.length === 0) {
        return err(PracticeErrQueueEmpty)
      }

      const cards: PracticeCardDto[] = []
      for (const record of dueRecords) {
        const caseDto = await this.caseDataSource.getCaseDtoById(record.caseId)
        cards.push(PracticeRepository.caseDtoToPracticeCard(caseDto))
      }

      return ok({ cards })
    } catch (thrown) {
      return err(practiceQueueErrorFromThrown(thrown))
    }
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

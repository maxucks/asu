import { err, ok } from "@/core/app_errors"
import type { Result } from "@/core/app_errors"
import { DrizzleCaseDataSource } from "@/core/data_sources/case_data_source_drizzle"
import type { LanguageDto } from "@/core/data_sources/language_data_source_drizzle"
import { DrizzleLanguageDataSource } from "@/core/data_sources/language_data_source_drizzle"
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

export type PracticeSessionDto = {
  readonly totalCases: number
  readonly card: PracticeCardDto
}

export const PracticeGrades = ["hard", "medium", "easy"] as const

export type PracticeGradeDto = (typeof PracticeGrades)[number]

import {
  applyPracticeGrade,
  createInitialStudyRecord,
  pickNextPracticeCaseId,
} from "@/practice/practice_srs"
import {
  practiceAssociationErrorFromThrown,
  PracticeErrAssociationNotOnCard,
  PracticeErrAssociationWrongKind,
  practiceCardNotFoundError,
  PracticeErrQueueEmpty,
  practiceLanguageErrorFromThrown,
  practiceQueueErrorFromThrown,
  type PracticeError,
} from "@/practice/practice_errors"

export class PracticeRepository {
  constructor(
    private readonly studyRecordDataSource: DrizzleStudyRecordDataSource,
    private readonly caseDataSource: DrizzleCaseDataSource,
    private readonly languageDataSource: DrizzleLanguageDataSource,
  ) {}

  async listLanguages(): Promise<Result<readonly LanguageDto[], PracticeError>> {
    try {
      return ok(await this.languageDataSource.listLanguageDtos())
    } catch (thrown) {
      return err(practiceLanguageErrorFromThrown(thrown))
    }
  }

  async createLanguage(name: string, icon: string): Promise<Result<LanguageDto, PracticeError>> {
    try {
      return ok(await this.languageDataSource.createLanguageDto(name, icon))
    } catch (thrown) {
      return err(practiceLanguageErrorFromThrown(thrown))
    }
  }

  async updateLanguage(
    languageId: string,
    patch: { readonly name?: string; readonly icon?: string },
  ): Promise<Result<LanguageDto, PracticeError>> {
    try {
      return ok(await this.languageDataSource.updateLanguageDto(languageId, patch))
    } catch (thrown) {
      return err(practiceLanguageErrorFromThrown(thrown))
    }
  }

  async deleteLanguage(languageId: string): Promise<Result<void, PracticeError>> {
    try {
      await this.languageDataSource.deleteLanguageDto(languageId)
      return ok(undefined)
    } catch (thrown) {
      return err(practiceLanguageErrorFromThrown(thrown))
    }
  }

  async appendTextAssociation(
    caseId: string,
    text: string,
    tileColor: string | null,
  ): Promise<Result<PracticeCardDto, PracticeError>> {
    try {
      const existing = await this.caseDataSource.getCaseDtoById(caseId)
      const association: AssociationDto = {
        id: `assoc-${crypto.randomUUID()}`,
        kind: "text",
        contentRef: text,
        tileColor,
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
        tileColor: null,
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
    tileColor: string | null,
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

      const caseDto = await this.caseDataSource.updateTextAssociationDto(caseId, associationId, {
        text,
        tileColor,
      })
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

  async reorderAssociations(
    caseId: string,
    associationIds: readonly string[],
  ): Promise<Result<PracticeCardDto, PracticeError>> {
    try {
      const existing = await this.caseDataSource.getCaseDtoById(caseId)
      const onCard = new Set(existing.associations.map((item) => item.id))
      if (associationIds.length !== onCard.size) {
        return err(PracticeErrAssociationNotOnCard)
      }
      for (const id of associationIds) {
        if (!onCard.has(id)) {
          return err(PracticeErrAssociationNotOnCard)
        }
      }

      const caseDto = await this.caseDataSource.reorderAssociationsDto(caseId, associationIds)
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

  async listCases(languageId: string): Promise<Result<PracticeQueueDto, PracticeError>> {
    try {
      const allCases = await this.caseDataSource.listCaseDtosByLanguageId(languageId)
      const cards = allCases.map((caseDto) => PracticeRepository.caseDtoToPracticeCard(caseDto))
      return ok({ cards })
    } catch (thrown) {
      return err(practiceQueueErrorFromThrown(thrown))
    }
  }

  async getQueue(languageId: string): Promise<Result<PracticeQueueDto, PracticeError>> {
    const started = await this.startPracticeSession(languageId)
    if (!started.ok) return started

    return ok({ cards: [started.value.card] })
  }

  async startPracticeSession(languageId: string): Promise<Result<PracticeSessionDto, PracticeError>> {
    try {
      const card = await this.pickPracticeCardDto(languageId, null)
      if (!card) {
        return err(PracticeErrQueueEmpty)
      }

      const totalCases = (await this.caseDataSource.listCaseDtosByLanguageId(languageId)).length
      return ok({ totalCases, card })
    } catch (thrown) {
      return err(practiceQueueErrorFromThrown(thrown))
    }
  }

  async pickNextPracticeCard(
    languageId: string,
    excludeCaseId: string | null,
  ): Promise<Result<PracticeSessionDto, PracticeError>> {
    try {
      const card = await this.pickPracticeCardDto(languageId, excludeCaseId)
      if (!card) {
        return err(PracticeErrQueueEmpty)
      }

      const totalCases = (await this.caseDataSource.listCaseDtosByLanguageId(languageId)).length
      return ok({ totalCases, card })
    } catch (thrown) {
      return err(practiceQueueErrorFromThrown(thrown))
    }
  }

  private async pickPracticeCardDto(
    languageId: string,
    excludeCaseId: string | null,
  ): Promise<PracticeCardDto | null> {
    const allCases = await this.caseDataSource.listCaseDtosByLanguageId(languageId)
    if (allCases.length === 0) {
      return null
    }

    const caseIds = allCases.map((item) => item.id)
    const records = await this.studyRecordDataSource.listStudyRecordDtosByCaseIds(caseIds)
    const recordByCaseId = new Map(records.map((record) => [record.caseId, record]))

    const nextId = pickNextPracticeCaseId(caseIds, recordByCaseId, new Date(), excludeCaseId)
    const caseDto = allCases.find((item) => item.id === nextId)
    if (!caseDto) {
      return null
    }

    return PracticeRepository.caseDtoToPracticeCard(caseDto)
  }

  async submitGrade(
    caseId: string,
    grade: PracticeGradeDto,
  ): Promise<Result<void, PracticeError>> {
    try {
      await this.caseDataSource.getCaseDtoById(caseId)
      const existing =
        (await this.studyRecordDataSource.getStudyRecordDtoByCaseId(caseId)) ??
        createInitialStudyRecord(caseId)
      const updated = applyPracticeGrade(existing, grade, new Date())
      await this.studyRecordDataSource.upsertStudyRecordDto(updated)
      return ok(undefined)
    } catch (thrown) {
      if (thrown instanceof Error && thrown.message.startsWith("Record not found")) {
        return err(practiceCardNotFoundError(thrown.message))
      }
      return err(practiceQueueErrorFromThrown(thrown))
    }
  }

  async createCase(
    languageId: string,
    lemmaText: string,
    meaning: string | null,
  ): Promise<Result<PracticeCardDto, PracticeError>> {
    try {
      const caseDto = await this.caseDataSource.createCaseDto(lemmaText, meaning, languageId)
      await this.studyRecordDataSource.insertStudyRecordDto(createInitialStudyRecord(caseDto.id))
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

import { err, ok } from "@/core/app_errors"
import { newEntityId } from "@/core/entity_id"
import type { Result } from "@/core/app_errors"
import { DrizzleCaseDataSource } from "@/core/data_sources/case_data_source_drizzle"
import type { LanguageDto } from "@/core/data_sources/language_data_source_drizzle"
import { DrizzleLanguageDataSource } from "@/core/data_sources/language_data_source_drizzle"
import {
  DrizzleCategoryDataSource,
  type CategoryDto,
} from "@/core/data_sources/category_data_source_drizzle"
import {
  DrizzleStudyRecordDataSource,
  type StudyRecordDto,
} from "@/core/data_sources/study_record_data_source_drizzle"
import type {
  AssociationDto,
  CaseDto,
  CaseRepresentationDto,
} from "@/core/data_sources/case_data_source_drizzle"
import type { CaseRepresentationWrite } from "@/core/data_sources/case_representation_data_source_drizzle"
import type {
  DrizzleRepresentationTypeDataSource,
  RepresentationTypeDto,
} from "@/core/data_sources/representation_type_data_source_drizzle"
import type {
  DrizzleNoteDataSource,
  NoteDto,
} from "@/core/data_sources/note_data_source_drizzle"

export type CaseCategoryRefDto = {
  readonly id: string
  readonly name: string
}

export type CaseNoteRefDto = {
  readonly id: string
  readonly name: string
  readonly content: string
}

export type PracticeCardDto = {
  readonly id: string
  readonly languageName: string
  readonly value: string
  readonly meaning: string | null
  readonly associations: readonly AssociationDto[]
  readonly categories: readonly CaseCategoryRefDto[]
  readonly representations: readonly CaseRepresentationDto[]
  readonly notes: readonly CaseNoteRefDto[]
}

export type { NoteDto }

export type { CaseRepresentationDto, RepresentationTypeDto }

export type PracticeQueueDto = {
  readonly cards: readonly PracticeCardDto[]
}

export type PracticeSessionDto = {
  readonly totalCases: number
  readonly card: PracticeCardDto
}

export const PracticeGrades = ["hard", "medium", "easy"] as const

export type PracticeGradeDto = (typeof PracticeGrades)[number]

import { buildPracticePackRound } from "@/practice/practice_pack"
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
    private readonly categoryDataSource: DrizzleCategoryDataSource,
    private readonly languageDataSource: DrizzleLanguageDataSource,
    private readonly representationTypeDataSource: DrizzleRepresentationTypeDataSource,
    private readonly noteDataSource: DrizzleNoteDataSource,
  ) {}

  async listRepresentationTypes(
    languageId: string,
  ): Promise<Result<readonly RepresentationTypeDto[], PracticeError>> {
    try {
      return ok(await this.representationTypeDataSource.listForLanguageId(languageId))
    } catch (thrown) {
      return err(practiceQueueErrorFromThrown(thrown))
    }
  }

  private async listCasesForPractice(
    languageId: string,
    categoryId: string | null,
  ): Promise<readonly CaseDto[]> {
    let allCases = await this.caseDataSource.listCaseDtosByLanguageId(languageId)
    if (categoryId) {
      const languageForCategory = await this.categoryDataSource.getCategoryLanguageId(categoryId)
      if (languageForCategory !== languageId) {
        return []
      }
      const allowed = new Set(await this.categoryDataSource.listCaseIdsForCategory(categoryId))
      allCases = allCases.filter((item) => allowed.has(item.id))
    }
    return allCases
  }

  async listLanguages(): Promise<Result<readonly LanguageDto[], PracticeError>> {
    try {
      return ok(await this.languageDataSource.listLanguageDtos())
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
        id: newEntityId(),
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
        id: newEntityId(),
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

  async listStudyRecords(
    languageId: string,
    categoryId: string | null = null,
  ): Promise<Result<readonly StudyRecordDto[], PracticeError>> {
    try {
      const allCases = await this.listCasesForPractice(languageId, categoryId)
      const caseIds = allCases.map((item) => item.id)
      const records = await this.studyRecordDataSource.listStudyRecordDtosByCaseIds(caseIds)
      return ok(records)
    } catch (thrown) {
      return err(practiceQueueErrorFromThrown(thrown))
    }
  }

  async listCases(
    languageId: string,
    categoryId: string | null = null,
  ): Promise<Result<PracticeQueueDto, PracticeError>> {
    try {
      const allCases = await this.listCasesForPractice(languageId, categoryId)
      const cards = allCases.map((caseDto) => PracticeRepository.caseDtoToPracticeCard(caseDto))
      return ok({ cards })
    } catch (thrown) {
      return err(practiceQueueErrorFromThrown(thrown))
    }
  }

  async listCategories(languageId: string): Promise<Result<readonly CategoryDto[], PracticeError>> {
    try {
      return ok(await this.categoryDataSource.listCategoryDtos(languageId))
    } catch (thrown) {
      return err(practiceQueueErrorFromThrown(thrown))
    }
  }

  async createCategory(languageId: string, name: string): Promise<Result<CategoryDto, PracticeError>> {
    try {
      return ok(await this.categoryDataSource.createCategoryDto(languageId, name))
    } catch (thrown) {
      return err(practiceQueueErrorFromThrown(thrown))
    }
  }

  async listNotes(languageId: string): Promise<Result<readonly NoteDto[], PracticeError>> {
    try {
      return ok(await this.noteDataSource.listNoteDtos(languageId))
    } catch (thrown) {
      return err(practiceQueueErrorFromThrown(thrown))
    }
  }

  async createNote(
    languageId: string,
    name: string,
    content: string,
  ): Promise<Result<NoteDto, PracticeError>> {
    try {
      return ok(await this.noteDataSource.createNoteDto(languageId, name, content))
    } catch (thrown) {
      return err(practiceQueueErrorFromThrown(thrown))
    }
  }

  async updateNote(
    noteId: string,
    patch: { readonly name?: string; readonly content?: string },
  ): Promise<Result<NoteDto, PracticeError>> {
    try {
      return ok(await this.noteDataSource.updateNoteDto(noteId, patch))
    } catch (thrown) {
      if (thrown instanceof Error && thrown.message.startsWith("Record not found")) {
        return err(practiceCardNotFoundError(thrown.message))
      }
      return err(practiceQueueErrorFromThrown(thrown))
    }
  }

  async deleteNote(noteId: string): Promise<Result<void, PracticeError>> {
    try {
      await this.noteDataSource.deleteNoteDto(noteId)
      return ok(undefined)
    } catch (thrown) {
      if (thrown instanceof Error && thrown.message.startsWith("Record not found")) {
        return err(practiceCardNotFoundError(thrown.message))
      }
      return err(practiceQueueErrorFromThrown(thrown))
    }
  }

  async linkCaseNote(
    caseId: string,
    link: { readonly noteId: string } | { readonly name: string; readonly content: string },
  ): Promise<Result<PracticeCardDto, PracticeError>> {
    try {
      let noteId: string
      if ("noteId" in link) {
        noteId = link.noteId
      } else {
        const languageId = await this.requireCaseLanguageId(caseId)
        const created = await this.noteDataSource.createNoteDto(languageId, link.name, link.content)
        noteId = created.id
      }
      await this.noteDataSource.attachNoteToCase(caseId, noteId)
      const caseDto = await this.caseDataSource.getCaseDtoById(caseId)
      return ok(PracticeRepository.caseDtoToPracticeCard(caseDto))
    } catch (thrown) {
      if (thrown instanceof Error && thrown.message.startsWith("Record not found")) {
        return err(practiceCardNotFoundError(thrown.message))
      }
      return err(practiceQueueErrorFromThrown(thrown))
    }
  }

  async unlinkCaseNote(caseId: string, noteId: string): Promise<Result<PracticeCardDto, PracticeError>> {
    try {
      await this.noteDataSource.detachNoteFromCase(caseId, noteId)
      const caseDto = await this.caseDataSource.getCaseDtoById(caseId)
      return ok(PracticeRepository.caseDtoToPracticeCard(caseDto))
    } catch (thrown) {
      if (thrown instanceof Error && thrown.message.startsWith("Record not found")) {
        return err(practiceCardNotFoundError(thrown.message))
      }
      return err(practiceQueueErrorFromThrown(thrown))
    }
  }

  private async requireCaseLanguageId(caseId: string): Promise<string> {
    const languageId = await this.categoryDataSource.getCaseLanguageId(caseId)
    if (!languageId) {
      throw new Error(`Record not found: ${caseId}`)
    }
    return languageId
  }

  async setCaseCategories(
    caseId: string,
    categoryIds: readonly string[],
  ): Promise<Result<PracticeCardDto, PracticeError>> {
    try {
      await this.categoryDataSource.setCaseCategoryIds(caseId, categoryIds)
      const caseDto = await this.caseDataSource.getCaseDtoById(caseId)
      return ok(PracticeRepository.caseDtoToPracticeCard(caseDto))
    } catch (thrown) {
      if (thrown instanceof Error && thrown.message.startsWith("Record not found")) {
        return err(practiceCardNotFoundError(thrown.message))
      }
      return err(practiceQueueErrorFromThrown(thrown))
    }
  }

  async getQueue(languageId: string): Promise<Result<PracticeQueueDto, PracticeError>> {
    const started = await this.startPracticeSession(languageId)
    if (!started.ok) return started

    return ok({ cards: [started.value.card] })
  }

  async startPracticeSession(
    languageId: string,
    categoryId: string | null = null,
  ): Promise<Result<PracticeSessionDto, PracticeError>> {
    try {
      const allCases = await this.listCasesForPractice(languageId, categoryId)
      if (allCases.length === 0) {
        return err(PracticeErrQueueEmpty)
      }

      const caseIds = allCases.map((item) => item.id)
      const records = await this.studyRecordDataSource.listStudyRecordDtosByCaseIds(caseIds)
      const recordByCaseId = new Map(records.map((record) => [record.caseId, record]))
      const queue = buildPracticePackRound(caseIds, recordByCaseId)
      const firstId = queue[0]
      const caseDto = allCases.find((item) => item.id === firstId) ?? allCases[0]!

      return ok({
        totalCases: allCases.length,
        card: PracticeRepository.caseDtoToPracticeCard(caseDto),
      })
    } catch (thrown) {
      return err(practiceQueueErrorFromThrown(thrown))
    }
  }

  async pickNextPracticeCard(
    languageId: string,
    excludeCaseId: string | null,
    categoryId: string | null = null,
  ): Promise<Result<PracticeSessionDto, PracticeError>> {
    try {
      const card = await this.pickPracticeCardDto(languageId, excludeCaseId, categoryId)
      if (!card) {
        return err(PracticeErrQueueEmpty)
      }

      const totalCases = (await this.listCasesForPractice(languageId, categoryId)).length
      return ok({ totalCases, card })
    } catch (thrown) {
      return err(practiceQueueErrorFromThrown(thrown))
    }
  }

  private async pickPracticeCardDto(
    languageId: string,
    excludeCaseId: string | null,
    categoryId: string | null,
  ): Promise<PracticeCardDto | null> {
    const allCases = await this.listCasesForPractice(languageId, categoryId)
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
    value: string,
    meaning: string | null,
    representations?: readonly CaseRepresentationWrite[],
  ): Promise<Result<PracticeCardDto, PracticeError>> {
    try {
      const caseDto = await this.caseDataSource.createCaseDto(value, meaning, languageId, representations)
      await this.studyRecordDataSource.insertStudyRecordDto(createInitialStudyRecord(caseDto.id))
      return ok(PracticeRepository.caseDtoToPracticeCard(caseDto))
    } catch (thrown) {
      return err(practiceQueueErrorFromThrown(thrown))
    }
  }

  async updateCase(
    caseId: string,
    patch: {
      readonly value?: string
      readonly meaning?: string | null
      readonly representations?: readonly CaseRepresentationWrite[]
    },
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
      value: caseDto.value,
      meaning: caseDto.meaning,
      associations: caseDto.associations,
      categories: caseDto.categories,
      representations: caseDto.representations,
      notes: caseDto.notes ?? [],
    }
  }

}

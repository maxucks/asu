import { err, ok } from "@/core/app_errors";
import type { Result } from "@/core/app_errors";
import type {
  AssociationDto,
  CaseDto,
  PracticeCardDto,
  PracticeQueueDto,
  PracticeSessionDto,
} from "@/core/data_sources/http_case_data_source";
import type { HttpCaseDataSource } from "@/core/data_sources/http_case_data_source";
import type { HttpLanguageDataSource } from "@/core/data_sources/http_language_data_source";
import type { LanguageDto } from "@/core/data_sources/http_language_data_source";
import {
  practiceAssociationErrorFromThrown,
  practiceCardNotFoundError,
  PracticeErrAssociationNotOnCard,
  PracticeErrAssociationWrongKind,
  practiceLanguageErrorFromThrown,
  practiceQueueErrorFromThrown,
  type PracticeError,
} from "@/practice/practice_errors";

export type {
  PracticeCardDto,
  PracticeQueueDto,
  PracticeSessionDto,
} from "@/core/data_sources/http_case_data_source";
export type { LanguageDto } from "@/core/data_sources/http_language_data_source";

export const PracticeGrades = ["hard", "medium", "easy"] as const;

export type PracticeGradeDto = (typeof PracticeGrades)[number];

export class PracticeRepository {
  constructor(
    private readonly caseDataSource: HttpCaseDataSource,
    private readonly languageDataSource: HttpLanguageDataSource,
  ) {}

  async listLanguages(): Promise<Result<readonly LanguageDto[], PracticeError>> {
    try {
      return ok(await this.languageDataSource.listLanguages());
    } catch (thrown) {
      return err(practiceLanguageErrorFromThrown(thrown));
    }
  }

  async createLanguage(name: string, icon: string): Promise<Result<LanguageDto, PracticeError>> {
    try {
      return ok(await this.languageDataSource.createLanguage(name, icon));
    } catch (thrown) {
      return err(practiceLanguageErrorFromThrown(thrown));
    }
  }

  async updateLanguage(
    languageId: string,
    patch: { readonly name?: string; readonly icon?: string },
  ): Promise<Result<LanguageDto, PracticeError>> {
    try {
      return ok(await this.languageDataSource.updateLanguage(languageId, patch));
    } catch (thrown) {
      return err(practiceLanguageErrorFromThrown(thrown));
    }
  }

  async deleteLanguage(languageId: string): Promise<Result<void, PracticeError>> {
    try {
      await this.languageDataSource.deleteLanguage(languageId);
      return ok(undefined);
    } catch (thrown) {
      return err(practiceLanguageErrorFromThrown(thrown));
    }
  }

  async appendTextAssociation(
    caseId: string,
    text: string,
    tileColor: string | null,
  ): Promise<Result<PracticeCardDto, PracticeError>> {
    try {
      const existing = await this.caseDataSource.getCaseDtoById(caseId);
      const association: AssociationDto = {
        id: `assoc-${crypto.randomUUID()}`,
        kind: "text",
        contentRef: text,
        tileColor,
        sortOrder: existing.associations.length,
        createdAt: new Date().toISOString(),
        hiddenFromPractice: false,
      };
      const caseDto = await this.caseDataSource.appendAssociationDto(
        caseId,
        association,
      );
      return ok(PracticeRepository.caseDtoToPracticeCard(caseDto));
    } catch (thrown) {
      return err(practiceAssociationErrorFromThrown(thrown));
    }
  }

  async appendImageAssociation(
    caseId: string,
    url: string,
  ): Promise<Result<PracticeCardDto, PracticeError>> {
    try {
      const existing = await this.caseDataSource.getCaseDtoById(caseId);
      const association: AssociationDto = {
        id: `assoc-${crypto.randomUUID()}`,
        kind: "image",
        contentRef: url,
        tileColor: null,
        sortOrder: existing.associations.length,
        createdAt: new Date().toISOString(),
        hiddenFromPractice: false,
      };
      const caseDto = await this.caseDataSource.appendAssociationDto(
        caseId,
        association,
      );
      return ok(PracticeRepository.caseDtoToPracticeCard(caseDto));
    } catch (thrown) {
      return err(practiceAssociationErrorFromThrown(thrown));
    }
  }

  async updateTextAssociation(
    caseId: string,
    associationId: string,
    text: string,
    tileColor: string | null,
  ): Promise<Result<PracticeCardDto, PracticeError>> {
    try {
      const existing = await this.caseDataSource.getCaseDtoById(caseId);
      const target = existing.associations.find((item) => item.id === associationId);
      if (!target) {
        return err(PracticeErrAssociationNotOnCard);
      }
      if (target.kind !== "text") {
        return err(PracticeErrAssociationWrongKind);
      }

      const caseDto = await this.caseDataSource.updateTextAssociationDto(caseId, associationId, text, tileColor);
      return ok(PracticeRepository.caseDtoToPracticeCard(caseDto));
    } catch (thrown) {
      return err(practiceAssociationErrorFromThrown(thrown));
    }
  }

  async updateImageAssociation(
    caseId: string,
    associationId: string,
    url: string,
  ): Promise<Result<PracticeCardDto, PracticeError>> {
    try {
      const existing = await this.caseDataSource.getCaseDtoById(caseId);
      const target = existing.associations.find((item) => item.id === associationId);
      if (!target) {
        return err(PracticeErrAssociationNotOnCard);
      }
      if (target.kind !== "image") {
        return err(PracticeErrAssociationWrongKind);
      }

      const caseDto = await this.caseDataSource.updateImageAssociationContentRefDto(
        caseId,
        associationId,
        url,
      );
      return ok(PracticeRepository.caseDtoToPracticeCard(caseDto));
    } catch (thrown) {
      return err(practiceAssociationErrorFromThrown(thrown));
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
      );
      return ok(PracticeRepository.caseDtoToPracticeCard(caseDto));
    } catch (thrown) {
      return err(practiceAssociationErrorFromThrown(thrown));
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
        return err(PracticeErrAssociationNotOnCard);
      }
      for (const id of associationIds) {
        if (!onCard.has(id)) {
          return err(PracticeErrAssociationNotOnCard);
        }
      }

      const caseDto = await this.caseDataSource.reorderAssociationsDto(caseId, associationIds);
      return ok(PracticeRepository.caseDtoToPracticeCard(caseDto));
    } catch (thrown) {
      return err(practiceAssociationErrorFromThrown(thrown));
    }
  }

  async deleteAssociation(
    caseId: string,
    associationId: string,
  ): Promise<Result<PracticeCardDto, PracticeError>> {
    try {
      const caseDto = await this.caseDataSource.deleteAssociationDto(
        caseId,
        associationId,
      );
      return ok(PracticeRepository.caseDtoToPracticeCard(caseDto));
    } catch (thrown) {
      return err(practiceAssociationErrorFromThrown(thrown));
    }
  }

  async submitGrade(caseId: string, grade: PracticeGradeDto): Promise<Result<void, PracticeError>> {
    try {
      await this.caseDataSource.submitGradeDto(caseId, grade);
      return ok(undefined);
    } catch (thrown) {
      return err(practiceQueueErrorFromThrown(thrown));
    }
  }

  async listCases(languageId: string): Promise<Result<PracticeQueueDto, PracticeError>> {
    try {
      const listing = await this.caseDataSource.fetchCasesByLanguageId(languageId);
      return ok(listing);
    } catch (thrown) {
      return err(practiceQueueErrorFromThrown(thrown));
    }
  }

  async getQueue(languageId: string): Promise<Result<PracticeQueueDto, PracticeError>> {
    try {
      const queue = await this.caseDataSource.fetchPracticeQueue(languageId);
      return ok(queue);
    } catch (thrown) {
      return err(practiceQueueErrorFromThrown(thrown));
    }
  }

  async startPracticeSession(languageId: string): Promise<Result<PracticeSessionDto, PracticeError>> {
    try {
      return ok(await this.caseDataSource.fetchPracticeSession(languageId));
    } catch (thrown) {
      return err(practiceQueueErrorFromThrown(thrown));
    }
  }

  async pickNextPracticeCard(
    languageId: string,
    excludeCaseId: string | null,
  ): Promise<Result<PracticeSessionDto, PracticeError>> {
    try {
      return ok(await this.caseDataSource.pickNextPracticeCard(languageId, excludeCaseId));
    } catch (thrown) {
      return err(practiceQueueErrorFromThrown(thrown));
    }
  }

  async createCase(
    languageId: string,
    lemmaText: string,
    meaning: string | null,
  ): Promise<Result<PracticeCardDto, PracticeError>> {
    try {
      const caseDto = await this.caseDataSource.createCaseDto(languageId, lemmaText, meaning);
      return ok(caseDto);
    } catch (thrown) {
      return err(practiceQueueErrorFromThrown(thrown));
    }
  }

  async updateCase(
    caseId: string,
    patch: { readonly lemmaText?: string; readonly meaning?: string | null },
  ): Promise<Result<PracticeCardDto, PracticeError>> {
    try {
      const caseDto = await this.caseDataSource.updateCaseDto(caseId, patch);
      return ok(caseDto);
    } catch (thrown) {
      if (thrown instanceof Error && thrown.message.startsWith("Record not found")) {
        return err(practiceCardNotFoundError(thrown.message));
      }
      return err(practiceQueueErrorFromThrown(thrown));
    }
  }

  async deleteCase(caseId: string): Promise<Result<void, PracticeError>> {
    try {
      await this.caseDataSource.deleteCaseDto(caseId);
      return ok(undefined);
    } catch (thrown) {
      if (thrown instanceof Error && thrown.message.startsWith("Record not found")) {
        return err(practiceCardNotFoundError(thrown.message));
      }
      return err(practiceQueueErrorFromThrown(thrown));
    }
  }

  private static caseDtoToPracticeCard(caseDto: CaseDto): PracticeCardDto {
    return {
      id: caseDto.id,
      languageName: caseDto.languageName,
      lemmaText: caseDto.lemmaText,
      meaning: caseDto.meaning,
      associations: caseDto.associations,
    };
  }

}

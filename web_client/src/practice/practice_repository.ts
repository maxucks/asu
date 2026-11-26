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
import type { CategoryDto } from "@/core/data_sources/http_category_data_source";
import type { HttpCategoryDataSource } from "@/core/data_sources/http_category_data_source";
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
export type { CategoryDto } from "@/core/data_sources/http_category_data_source";
export type { LanguageDto } from "@/core/data_sources/http_language_data_source";

export const PracticeGrades = ["hard", "medium", "easy"] as const;

export type PracticeGradeDto = (typeof PracticeGrades)[number];

export class PracticeRepository {
  constructor(
    private readonly caseDataSource: HttpCaseDataSource,
    private readonly languageDataSource: HttpLanguageDataSource,
    private readonly categoryDataSource: HttpCategoryDataSource,
  ) {}

  async listLanguages(): Promise<Result<readonly LanguageDto[], PracticeError>> {
    try {
      return ok(await this.languageDataSource.listLanguages());
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
        id: crypto.randomUUID(),
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
        id: crypto.randomUUID(),
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

  async listCases(
    languageId: string,
    categoryId: string | null = null,
  ): Promise<Result<PracticeQueueDto, PracticeError>> {
    try {
      const listing = await this.caseDataSource.fetchCasesByLanguageId(languageId, categoryId);
      return ok(listing);
    } catch (thrown) {
      return err(practiceQueueErrorFromThrown(thrown));
    }
  }

  async listCategories(languageId: string): Promise<Result<readonly CategoryDto[], PracticeError>> {
    try {
      return ok(await this.categoryDataSource.listCategories(languageId));
    } catch (thrown) {
      return err(practiceQueueErrorFromThrown(thrown));
    }
  }

  async createCategory(languageId: string, name: string): Promise<Result<CategoryDto, PracticeError>> {
    try {
      return ok(await this.categoryDataSource.createCategory(languageId, name));
    } catch (thrown) {
      return err(practiceQueueErrorFromThrown(thrown));
    }
  }

  async setCaseCategories(
    caseId: string,
    categoryIds: readonly string[],
  ): Promise<Result<PracticeCardDto, PracticeError>> {
    try {
      const caseDto = await this.caseDataSource.setCaseCategoriesDto(caseId, categoryIds);
      return ok(PracticeRepository.caseDtoToPracticeCard(caseDto));
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

  async startPracticeSession(
    languageId: string,
    categoryId: string | null = null,
  ): Promise<Result<PracticeSessionDto, PracticeError>> {
    try {
      return ok(await this.caseDataSource.fetchPracticeSession(languageId, categoryId));
    } catch (thrown) {
      return err(practiceQueueErrorFromThrown(thrown));
    }
  }

  async pickNextPracticeCard(
    languageId: string,
    excludeCaseId: string | null,
    categoryId: string | null = null,
  ): Promise<Result<PracticeSessionDto, PracticeError>> {
    try {
      return ok(await this.caseDataSource.pickNextPracticeCard(languageId, excludeCaseId, categoryId));
    } catch (thrown) {
      return err(practiceQueueErrorFromThrown(thrown));
    }
  }

  async createCase(
    languageId: string,
    value: string,
    meaning: string | null,
  ): Promise<Result<PracticeCardDto, PracticeError>> {
    try {
      const caseDto = await this.caseDataSource.createCaseDto(languageId, value, meaning);
      return ok(caseDto);
    } catch (thrown) {
      return err(practiceQueueErrorFromThrown(thrown));
    }
  }

  async updateCase(
    caseId: string,
    patch: { readonly value?: string; readonly meaning?: string | null },
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
      value: caseDto.value,
      meaning: caseDto.meaning,
      associations: caseDto.associations,
      categories: caseDto.categories ?? [],
    };
  }

}

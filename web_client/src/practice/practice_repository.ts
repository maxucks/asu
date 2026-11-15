import { err, ok } from "@/core/app_errors";
import type { Result } from "@/core/app_errors";
import type {
  AssociationDto,
  CaseDto,
  PracticeCardDto,
  PracticeQueueDto,
} from "@/core/data_sources/http_case_data_source";
import type { HttpCaseDataSource } from "@/core/data_sources/http_case_data_source";
import {
  practiceAssociationErrorFromThrown,
  practiceCardNotFoundError,
  PracticeErrAssociationNotOnCard,
  PracticeErrAssociationWrongKind,
  PracticeErrQueueEmpty,
  practiceQueueErrorFromThrown,
  type PracticeError,
} from "@/practice/practice_errors";

export type { PracticeCardDto, PracticeQueueDto } from "@/core/data_sources/http_case_data_source";

export const PracticeGrades = ["hard", "medium", "easy"] as const;

export type PracticeGradeDto = (typeof PracticeGrades)[number];

export class PracticeRepository {
  constructor(private readonly caseDataSource: HttpCaseDataSource) {}

  async appendTextAssociation(
    caseId: string,
    text: string,
  ): Promise<Result<PracticeCardDto, PracticeError>> {
    try {
      const existing = await this.caseDataSource.getCaseDtoById(caseId);
      const association: AssociationDto = {
        id: `assoc-${crypto.randomUUID()}`,
        kind: "text",
        contentRef: text,
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

      const caseDto = await this.caseDataSource.updateTextAssociationContentRefDto(
        caseId,
        associationId,
        text,
      );
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

  async getQueue(): Promise<Result<PracticeQueueDto, PracticeError>> {
    try {
      const queue = await this.caseDataSource.fetchPracticeQueue();
      if (queue.cards.length === 0) {
        return err(PracticeErrQueueEmpty);
      }
      return ok(queue);
    } catch (thrown) {
      return err(practiceQueueErrorFromThrown(thrown));
    }
  }

  async createCase(
    lemmaText: string,
    meaning: string | null,
  ): Promise<Result<PracticeCardDto, PracticeError>> {
    try {
      const caseDto = await this.caseDataSource.createCaseDto(lemmaText, meaning);
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

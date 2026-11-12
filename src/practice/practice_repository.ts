import { err, ok } from "@/core/app_errors";
import type { Result } from "@/core/app_errors";
import type { AssociationDto, CaseDto } from "@/core/data_sources/case_data_source";
import type { CaseDataSource } from "@/core/data_sources/case_data_source";
import { PracticeError } from "@/practice/practice_errors";
import type { StudyRecordDataSource } from "@/core/data_sources/study_record_data_source";

export type PracticeCardDto = {
  readonly id: string;
  readonly languageName: string;
  readonly lemmaText: string;
  readonly translation: string | null;
  readonly associations: readonly AssociationDto[];
};

export type PracticeQueueDto = {
  readonly cards: readonly PracticeCardDto[];
};

export const PRACTICE_GRADES = ["hard", "medium", "easy"] as const;

export type PracticeGradeDto = (typeof PRACTICE_GRADES)[number];

export class PracticeRepository {
  constructor(
    private readonly studyRecordDataSource: StudyRecordDataSource,
    private readonly caseDataSource: CaseDataSource,
  ) {}

  async addTextAssociation(
    caseId: string,
    contentRef: string,
  ): Promise<Result<PracticeCardDto, PracticeError>> {
    const text = contentRef.trim();
    if (text.length === 0) {
      return err(
        new PracticeError(
          "PRACTICE_ASSOCIATION_SAVE_FAILED",
          "Association text cannot be empty.",
        ),
      );
    }

    try {
      const existing = await this.caseDataSource.getCaseDtoById(caseId);
      const association: AssociationDto = {
        id: `assoc-${crypto.randomUUID()}`,
        kind: "text",
        contentRef: text,
        sortOrder: existing.associations.length,
        createdAt: new Date().toISOString(),
      };
      const caseDto = await this.caseDataSource.appendAssociationDto(
        caseId,
        association,
      );
      return ok(PracticeRepository.caseDtoToPracticeCard(caseDto));
    } catch (thrown) {
      return err(PracticeRepository.associationErrorFromThrown(thrown));
    }
  }

  async getQueue(): Promise<Result<PracticeQueueDto, PracticeError>> {
    try {
      const dueRecords = await this.studyRecordDataSource.listDueStudyRecordDtos();

      if (dueRecords.length === 0) {
        return err(
          new PracticeError("PRACTICE_NO_CARDS", "Nothing to review in the queue."),
        );
      }

      const cards: PracticeCardDto[] = [];
      for (const record of dueRecords) {
        const caseDto = await this.caseDataSource.getCaseDtoById(record.caseId);
        cards.push(PracticeRepository.caseDtoToPracticeCard(caseDto));
      }

      return ok({ cards });
    } catch (thrown) {
      return err(PracticeRepository.errorFromThrown(thrown));
    }
  }

  private static caseDtoToPracticeCard(caseDto: CaseDto): PracticeCardDto {
    return {
      id: caseDto.id,
      languageName: caseDto.languageName,
      lemmaText: caseDto.lemmaText,
      translation: caseDto.translation,
      associations: caseDto.associations,
    };
  }

  private static associationErrorFromThrown(thrown: unknown): PracticeError {
    if (thrown instanceof Error) {
      if (thrown.message.startsWith("Record not found")) {
        return new PracticeError("PRACTICE_CARD_NOT_FOUND", thrown.message);
      }
      return new PracticeError("PRACTICE_ASSOCIATION_SAVE_FAILED", thrown.message);
    }
    return new PracticeError(
      "PRACTICE_ASSOCIATION_SAVE_FAILED",
      "Could not save association.",
    );
  }

  private static errorFromThrown(thrown: unknown): PracticeError {
    if (thrown instanceof Error) {
      if (thrown.message.startsWith("Record not found")) {
        return new PracticeError("PRACTICE_CARD_NOT_FOUND", thrown.message);
      }
      return new PracticeError("PRACTICE_NO_CARDS", thrown.message);
    }
    return new PracticeError("PRACTICE_NO_CARDS", "Practice data failed.");
  }
}

/** Serialized shapes at the case persistence boundary (no app logic). */

export const ASSOCIATION_KINDS = [
  "text",
  "image",
  "audio",
  "sketch",
  "video",
] as const;

export type AssociationKind = (typeof ASSOCIATION_KINDS)[number];

export type AssociationDto = {
  readonly id: string;
  readonly kind: AssociationKind;
  readonly contentRef: string;
  readonly sortOrder: number;
  readonly createdAt: string;
  /** When true, cue is stored but collapsed on the practice card face until revealed. */
  readonly hiddenFromPractice: boolean;
};

export type CaseDto = {
  readonly id: string;
  readonly languageName: string;
  readonly lemmaText: string;
  readonly translation: string | null;
  readonly associations: readonly AssociationDto[];
};

/**
 * Driver for case rows and nested association payloads: load/store via DB, API,
 * or in-memory store; map raw records ↔ DTOs. Failures throw.
 */
export interface CaseDataSource {
  getCaseDtoById(caseId: string): Promise<CaseDto>;
  appendAssociationDto(
    caseId: string,
    association: AssociationDto,
  ): Promise<CaseDto>;
  updateAssociationContentRefDto(
    caseId: string,
    associationId: string,
    contentRef: string,
  ): Promise<CaseDto>;
  updateAssociationHiddenFromPracticeDto(
    caseId: string,
    associationId: string,
    hiddenFromPractice: boolean,
  ): Promise<CaseDto>;
  deleteAssociationDto(caseId: string, associationId: string): Promise<CaseDto>;
}

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
}

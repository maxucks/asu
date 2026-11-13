import { err } from "@/core/app_errors";
import type { Result } from "@/core/app_errors";
import {
  parsePracticeAssociationText,
  parsePracticeImageAssociationUrl,
  type PracticeCardDto,
} from "@asu/contracts";
import {
  PracticeErrAssociationEmptyText,
  PracticeErrAssociationInvalidImageUrl,
  type PracticeError,
} from "@/practice/practice_errors";
import type { PracticeRepository } from "@/practice/practice_repository";

export async function addTextAssociation(
  repository: PracticeRepository,
  caseId: string,
  rawText: string,
): Promise<Result<PracticeCardDto, PracticeError>> {
  const text = parsePracticeAssociationText(rawText);
  if (text === null) {
    return err(PracticeErrAssociationEmptyText);
  }
  return repository.appendTextAssociation(caseId, text);
}

export async function addImageAssociationFromUrl(
  repository: PracticeRepository,
  caseId: string,
  rawUrl: string,
): Promise<Result<PracticeCardDto, PracticeError>> {
  const url = parsePracticeImageAssociationUrl(rawUrl);
  if (url === null) {
    return err(PracticeErrAssociationInvalidImageUrl);
  }
  return repository.appendImageAssociation(caseId, url);
}

export async function updateTextAssociation(
  repository: PracticeRepository,
  caseId: string,
  associationId: string,
  rawText: string,
): Promise<Result<PracticeCardDto, PracticeError>> {
  const text = parsePracticeAssociationText(rawText);
  if (text === null) {
    return err(PracticeErrAssociationEmptyText);
  }
  return repository.updateTextAssociation(caseId, associationId, text);
}

export async function updateImageAssociationFromUrl(
  repository: PracticeRepository,
  caseId: string,
  associationId: string,
  rawUrl: string,
): Promise<Result<PracticeCardDto, PracticeError>> {
  const url = parsePracticeImageAssociationUrl(rawUrl);
  if (url === null) {
    return err(PracticeErrAssociationInvalidImageUrl);
  }
  return repository.updateImageAssociation(caseId, associationId, url);
}

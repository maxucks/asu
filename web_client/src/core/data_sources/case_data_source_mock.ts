import type { AssociationDto, CaseDto } from "@asu/contracts"
import { SEED_CASES } from "@asu/contracts/dev-seed"

export { SEED_CASES } from "@asu/contracts/dev-seed"

function cloneCaseDto(entry: CaseDto): CaseDto {
  return {
    ...entry,
    associations: entry.associations.map((item) => ({ ...item })),
  }
}

function mapAssociation(
  entry: CaseDto,
  associationId: string,
  map: (item: AssociationDto) => AssociationDto,
): CaseDto {
  const index = entry.associations.findIndex((item) => item.id === associationId)
  if (index === -1) {
    throw new Error(`Association not found: ${associationId}`)
  }
  const associations = entry.associations.map((item, itemIndex) =>
    itemIndex === index ? map(item) : item,
  )
  return { ...entry, associations }
}

export class MockCaseDataSource {
  private readonly casesById = new Map(
    SEED_CASES.map((entry) => [entry.id, cloneCaseDto(entry)]),
  )

  async getCaseDtoById(caseId: string): Promise<CaseDto> {
    const entry = this.casesById.get(caseId)
    if (!entry) {
      throw new Error(`Record not found: ${caseId}`)
    }
    return cloneCaseDto(entry)
  }

  async appendAssociationDto(
    caseId: string,
    association: AssociationDto,
  ): Promise<CaseDto> {
    const entry = this.casesById.get(caseId)
    if (!entry) {
      throw new Error(`Record not found: ${caseId}`)
    }
    const updated: CaseDto = {
      ...entry,
      associations: [...entry.associations, association],
    }
    this.casesById.set(caseId, updated)
    return cloneCaseDto(updated)
  }

  async updateTextAssociationContentRefDto(
    caseId: string,
    associationId: string,
    text: string,
  ): Promise<CaseDto> {
    return this.setAssociationContentRef(caseId, associationId, text)
  }

  async updateImageAssociationContentRefDto(
    caseId: string,
    associationId: string,
    url: string,
  ): Promise<CaseDto> {
    return this.setAssociationContentRef(caseId, associationId, url)
  }

  private setAssociationContentRef(
    caseId: string,
    associationId: string,
    contentRef: string,
  ): CaseDto {
    const entry = this.casesById.get(caseId)
    if (!entry) {
      throw new Error(`Record not found: ${caseId}`)
    }
    const updated = mapAssociation(entry, associationId, (item) => ({
      ...item,
      contentRef,
    }))
    this.casesById.set(caseId, updated)
    return cloneCaseDto(updated)
  }

  async updateAssociationHiddenFromPracticeDto(
    caseId: string,
    associationId: string,
    hiddenFromPractice: boolean,
  ): Promise<CaseDto> {
    const entry = this.casesById.get(caseId)
    if (!entry) {
      throw new Error(`Record not found: ${caseId}`)
    }
    const updated = mapAssociation(entry, associationId, (item) => ({
      ...item,
      hiddenFromPractice,
    }))
    this.casesById.set(caseId, updated)
    return cloneCaseDto(updated)
  }

  async deleteAssociationDto(
    caseId: string,
    associationId: string,
  ): Promise<CaseDto> {
    const entry = this.casesById.get(caseId)
    if (!entry) {
      throw new Error(`Record not found: ${caseId}`)
    }
    const exists = entry.associations.some((item) => item.id === associationId)
    if (!exists) {
      throw new Error(`Association not found: ${associationId}`)
    }
    const updated: CaseDto = {
      ...entry,
      associations: entry.associations.filter((item) => item.id !== associationId),
    }
    this.casesById.set(caseId, updated)
    return cloneCaseDto(updated)
  }
}

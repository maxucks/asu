import { asuApiBaseUrl, requestJson } from "@/core/utils/request_json"
export type RepresentationTypeDto = {
  readonly id: number
  readonly name: string
  readonly languageId: string | null
}

type RepresentationTypesResponse = {
  readonly representationTypes: readonly RepresentationTypeDto[]
}

export class HttpRepresentationTypeDataSource {
  constructor(private readonly baseUrl: string = asuApiBaseUrl()) {}

  async listForLanguage(languageId: string): Promise<readonly RepresentationTypeDto[]> {
    const body = await requestJson<RepresentationTypesResponse>(
      this.baseUrl,
      "GET",
      `/api/practice/representation-types?languageId=${encodeURIComponent(languageId)}`,
    )
    return body.representationTypes
  }
}
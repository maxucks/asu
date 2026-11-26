import { asuApiBaseUrl, requestJson } from "@/core/utils/request_json"

export type LanguageDto = {
  readonly id: string
  readonly name: string
  readonly icon: string
  readonly caseCount: number
}

type LanguagesResponse = {
  readonly languages: readonly LanguageDto[]
}

export class HttpLanguageDataSource {
  constructor(private readonly baseUrl: string = asuApiBaseUrl()) {}

  async listLanguages(): Promise<readonly LanguageDto[]> {
    const body = await requestJson<LanguagesResponse>(this.baseUrl, "GET", "/api/practice/languages")
    return body.languages
  }
}
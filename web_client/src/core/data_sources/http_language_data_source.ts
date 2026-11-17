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

  async createLanguage(name: string, icon: string): Promise<LanguageDto> {
    return requestJson<LanguageDto>(this.baseUrl, "POST", "/api/practice/languages", { name, icon })
  }

  async updateLanguage(languageId: string, patch: { readonly name?: string; readonly icon?: string }): Promise<LanguageDto> {
    return requestJson<LanguageDto>(this.baseUrl, "PATCH", `/api/practice/languages/${languageId}`, { ...patch })
  }

  async deleteLanguage(languageId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/practice/languages/${languageId}`, { method: "DELETE" })
    if (!response.ok) {
      let message = `Request failed (${response.status})`
      try {
        const payload = (await response.json()) as { message?: string }
        if (typeof payload.message === "string" && payload.message.length > 0) {
          message = payload.message
        }
      } catch {
        // ignore
      }
      throw new Error(message)
    }
  }
}
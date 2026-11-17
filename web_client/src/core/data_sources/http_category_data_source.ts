import { asuApiBaseUrl, requestJson } from "@/core/utils/request_json"

export type CategoryDto = {
  readonly id: string
  readonly name: string
  readonly caseCount: number
}

type CategoriesResponse = {
  readonly categories: readonly CategoryDto[]
}

export class HttpCategoryDataSource {
  constructor(private readonly baseUrl: string = asuApiBaseUrl()) {}

  async listCategories(languageId: string): Promise<readonly CategoryDto[]> {
    const body = await requestJson<CategoriesResponse>(
      this.baseUrl,
      "GET",
      `/api/practice/categories?languageId=${encodeURIComponent(languageId)}`,
    )
    return body.categories
  }

  async createCategory(languageId: string, name: string): Promise<CategoryDto> {
    return requestJson<CategoryDto>(this.baseUrl, "POST", "/api/practice/categories", { languageId, name })
  }
}
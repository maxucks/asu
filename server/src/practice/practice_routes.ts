import { created, error, noContent, ok } from "@/core/hono_response"
import { parseJsonBody, parseQuery, parseRouteParams } from "@/core/validate_request"
import { log } from "@/core/logger"
import { practiceErrorHttpStatus } from "@/practice/practice_errors"
import {
  practiceAssociationHiddenBodySchema,
  practiceAssociationImageUrlBodySchema,
  practiceAssociationOrderBodySchema,
  practiceAssociationTextBodySchema,
  practiceGradeBodySchema,
  practiceOutcomeBodySchema,
  practiceCaseAssociationParamsSchema,
  practiceCaseIdParamsSchema,
  practiceCreateCaseBodySchema,
  practiceCreateCategoryBodySchema,
  practiceCreateLanguageBodySchema,
  practiceLanguageIdParamsSchema,
  practiceNextCardQuerySchema,
  practiceQueueQuerySchema,
  practiceSessionQuerySchema,
  practiceSetCaseCategoriesBodySchema,
  practiceUpdateLanguageBodySchema,
  practiceUpdateCaseBodySchema,
} from "@/practice/practice_route_schemas"
import { PracticeRepository } from "@/practice/practice_repository"
import { readAppSettings } from "@/core/app_settings"
import { Hono } from "hono"

export function createPracticeRoutes(repository: PracticeRepository) {
  const routes = new Hono()

  routes.post("/cases", async (c) => {
    const body = await parseJsonBody(c, practiceCreateCaseBodySchema)
    if (!body.ok) {
      return error(c, body.error, practiceErrorHttpStatus(body.error.code))
    }

    const result = await repository.createCase(body.value.languageId, body.value.lemmaText, body.value.meaning)
    if (!result.ok) {
      return error(c, result.error, practiceErrorHttpStatus(result.error.code))
    }
    return created(c, result.value)
  })

  routes.patch("/cases/:caseId", async (c) => {
    const params = parseRouteParams(c.req.param(), practiceCaseIdParamsSchema)
    if (!params.ok) {
      return error(c, params.error, practiceErrorHttpStatus(params.error.code))
    }
    const body = await parseJsonBody(c, practiceUpdateCaseBodySchema)
    if (!body.ok) {
      return error(c, body.error, practiceErrorHttpStatus(body.error.code))
    }

    const result = await repository.updateCase(params.value.caseId, body.value)
    if (!result.ok) {
      return error(c, result.error, practiceErrorHttpStatus(result.error.code))
    }
    return ok(c, result.value)
  })

  routes.post("/cases/:caseId/grade", async (c) => {
    const params = parseRouteParams(c.req.param(), practiceCaseIdParamsSchema)
    if (!params.ok) {
      return error(c, params.error, practiceErrorHttpStatus(params.error.code))
    }
    const body = await parseJsonBody(c, practiceGradeBodySchema)
    if (!body.ok) {
      return error(c, body.error, practiceErrorHttpStatus(body.error.code))
    }

    const result = await repository.submitGrade(params.value.caseId, body.value.grade)
    if (!result.ok) {
      return error(c, result.error, practiceErrorHttpStatus(result.error.code))
    }
    return noContent(c)
  })

  routes.post("/cases/:caseId/outcome", async (c) => {
    const params = parseRouteParams(c.req.param(), practiceCaseIdParamsSchema)
    if (!params.ok) {
      return error(c, params.error, practiceErrorHttpStatus(params.error.code))
    }
    const body = await parseJsonBody(c, practiceOutcomeBodySchema)
    if (!body.ok) {
      return error(c, body.error, practiceErrorHttpStatus(body.error.code))
    }

    const result = await repository.submitPracticeOutcome(params.value.caseId, body.value.outcome)
    if (!result.ok) {
      return error(c, result.error, practiceErrorHttpStatus(result.error.code))
    }
    return noContent(c)
  })

  routes.get("/settings", (c) => ok(c, readAppSettings()))

  routes.delete("/cases/:caseId", async (c) => {
    const params = parseRouteParams(c.req.param(), practiceCaseIdParamsSchema)
    if (!params.ok) {
      return error(c, params.error, practiceErrorHttpStatus(params.error.code))
    }

    const result = await repository.deleteCase(params.value.caseId)
    if (!result.ok) {
      return error(c, result.error, practiceErrorHttpStatus(result.error.code))
    }
    return noContent(c)
  })

  routes.get("/languages", async (c) => {
    const result = await repository.listLanguages()
    if (!result.ok) {
      return error(c, result.error, practiceErrorHttpStatus(result.error.code))
    }
    return ok(c, { languages: result.value })
  })

  routes.post("/languages", async (c) => {
    const body = await parseJsonBody(c, practiceCreateLanguageBodySchema)
    if (!body.ok) {
      return error(c, body.error, practiceErrorHttpStatus(body.error.code))
    }
    const result = await repository.createLanguage(body.value.name, body.value.icon)
    if (!result.ok) {
      return error(c, result.error, practiceErrorHttpStatus(result.error.code))
    }
    return created(c, result.value)
  })

  routes.patch("/languages/:languageId", async (c) => {
    const params = parseRouteParams(c.req.param(), practiceLanguageIdParamsSchema)
    if (!params.ok) {
      return error(c, params.error, practiceErrorHttpStatus(params.error.code))
    }
    const body = await parseJsonBody(c, practiceUpdateLanguageBodySchema)
    if (!body.ok) {
      return error(c, body.error, practiceErrorHttpStatus(body.error.code))
    }
    const result = await repository.updateLanguage(params.value.languageId, body.value)
    if (!result.ok) {
      return error(c, result.error, practiceErrorHttpStatus(result.error.code))
    }
    return ok(c, result.value)
  })

  routes.delete("/languages/:languageId", async (c) => {
    const params = parseRouteParams(c.req.param(), practiceLanguageIdParamsSchema)
    if (!params.ok) {
      return error(c, params.error, practiceErrorHttpStatus(params.error.code))
    }
    const result = await repository.deleteLanguage(params.value.languageId)
    if (!result.ok) {
      return error(c, result.error, practiceErrorHttpStatus(result.error.code))
    }
    return noContent(c)
  })

  routes.get("/cases", async (c) => {
    const query = parseQuery(c.req.query(), practiceQueueQuerySchema)
    if (!query.ok) {
      return error(c, query.error, practiceErrorHttpStatus(query.error.code))
    }
    const result = await repository.listCases(query.value.languageId, query.value.categoryId ?? null)
    if (!result.ok) {
      return error(c, result.error, practiceErrorHttpStatus(result.error.code))
    }
    return ok(c, result.value)
  })

  routes.get("/categories", async (c) => {
    const query = parseQuery(c.req.query(), practiceQueueQuerySchema)
    if (!query.ok) {
      return error(c, query.error, practiceErrorHttpStatus(query.error.code))
    }
    const result = await repository.listCategories(query.value.languageId)
    if (!result.ok) {
      return error(c, result.error, practiceErrorHttpStatus(result.error.code))
    }
    return ok(c, { categories: result.value })
  })

  routes.post("/categories", async (c) => {
    const body = await parseJsonBody(c, practiceCreateCategoryBodySchema)
    if (!body.ok) {
      return error(c, body.error, practiceErrorHttpStatus(body.error.code))
    }
    const result = await repository.createCategory(body.value.languageId, body.value.name)
    if (!result.ok) {
      return error(c, result.error, practiceErrorHttpStatus(result.error.code))
    }
    return created(c, result.value)
  })

  routes.patch("/cases/:caseId/categories", async (c) => {
    const params = parseRouteParams(c.req.param(), practiceCaseIdParamsSchema)
    if (!params.ok) {
      return error(c, params.error, practiceErrorHttpStatus(params.error.code))
    }
    const body = await parseJsonBody(c, practiceSetCaseCategoriesBodySchema)
    if (!body.ok) {
      return error(c, body.error, practiceErrorHttpStatus(body.error.code))
    }
    const result = await repository.setCaseCategories(params.value.caseId, body.value.categoryIds)
    if (!result.ok) {
      return error(c, result.error, practiceErrorHttpStatus(result.error.code))
    }
    return ok(c, result.value)
  })

  routes.get("/queue", async (c) => {
    const query = parseQuery(c.req.query(), practiceQueueQuerySchema)
    if (!query.ok) {
      return error(c, query.error, practiceErrorHttpStatus(query.error.code))
    }
    const result = await repository.getQueue(query.value.languageId)
    if (!result.ok) {
      log.warn("practice queue failed", { code: result.error.code })
      return error(c, result.error, practiceErrorHttpStatus(result.error.code))
    }
    log.info("practice queue loaded", { cards: result.value.cards.length })
    return ok(c, result.value)
  })

  routes.get("/session", async (c) => {
    const query = parseQuery(c.req.query(), practiceSessionQuerySchema)
    if (!query.ok) {
      return error(c, query.error, practiceErrorHttpStatus(query.error.code))
    }
    const result = await repository.startPracticeSession(
      query.value.languageId,
      query.value.categoryId ?? null,
    )
    if (!result.ok) {
      return error(c, result.error, practiceErrorHttpStatus(result.error.code))
    }
    return ok(c, result.value)
  })

  routes.get("/next", async (c) => {
    const query = parseQuery(c.req.query(), practiceNextCardQuerySchema)
    if (!query.ok) {
      return error(c, query.error, practiceErrorHttpStatus(query.error.code))
    }
    const result = await repository.pickNextPracticeCard(
      query.value.languageId,
      query.value.excludeCaseId ?? null,
      query.value.categoryId ?? null,
    )
    if (!result.ok) {
      return error(c, result.error, practiceErrorHttpStatus(result.error.code))
    }
    return ok(c, result.value)
  })

  routes.post("/cases/:caseId/associations/text", async (c) => {
    const params = parseRouteParams(c.req.param(), practiceCaseIdParamsSchema)
    if (!params.ok) {
      return error(c, params.error, practiceErrorHttpStatus(params.error.code))
    }
    const body = await parseJsonBody(c, practiceAssociationTextBodySchema)
    if (!body.ok) {
      return error(c, body.error, practiceErrorHttpStatus(body.error.code))
    }

    const result = await repository.appendTextAssociation(
      params.value.caseId,
      body.value.text,
      body.value.tileColor,
    )
    if (!result.ok) {
      return error(c, result.error, practiceErrorHttpStatus(result.error.code))
    }
    return ok(c, result.value)
  })

  routes.post("/cases/:caseId/associations/image-url", async (c) => {
    const params = parseRouteParams(c.req.param(), practiceCaseIdParamsSchema)
    if (!params.ok) {
      return error(c, params.error, practiceErrorHttpStatus(params.error.code))
    }
    const body = await parseJsonBody(c, practiceAssociationImageUrlBodySchema)
    if (!body.ok) {
      return error(c, body.error, practiceErrorHttpStatus(body.error.code))
    }

    const result = await repository.appendImageAssociation(params.value.caseId, body.value.url)
    if (!result.ok) {
      return error(c, result.error, practiceErrorHttpStatus(result.error.code))
    }
    return ok(c, result.value)
  })

  routes.patch("/cases/:caseId/associations/:associationId/text", async (c) => {
    const params = parseRouteParams(c.req.param(), practiceCaseAssociationParamsSchema)
    if (!params.ok) {
      return error(c, params.error, practiceErrorHttpStatus(params.error.code))
    }
    const body = await parseJsonBody(c, practiceAssociationTextBodySchema)
    if (!body.ok) {
      return error(c, body.error, practiceErrorHttpStatus(body.error.code))
    }

    const result = await repository.updateTextAssociation(
      params.value.caseId,
      params.value.associationId,
      body.value.text,
      body.value.tileColor,
    )
    if (!result.ok) {
      return error(c, result.error, practiceErrorHttpStatus(result.error.code))
    }
    return ok(c, result.value)
  })

  routes.patch("/cases/:caseId/associations/:associationId/image-url", async (c) => {
    const params = parseRouteParams(c.req.param(), practiceCaseAssociationParamsSchema)
    if (!params.ok) {
      return error(c, params.error, practiceErrorHttpStatus(params.error.code))
    }
    const body = await parseJsonBody(c, practiceAssociationImageUrlBodySchema)
    if (!body.ok) {
      return error(c, body.error, practiceErrorHttpStatus(body.error.code))
    }

    const result = await repository.updateImageAssociation(
      params.value.caseId,
      params.value.associationId,
      body.value.url,
    )
    if (!result.ok) {
      return error(c, result.error, practiceErrorHttpStatus(result.error.code))
    }
    return ok(c, result.value)
  })

  routes.patch("/cases/:caseId/associations/order", async (c) => {
    const params = parseRouteParams(c.req.param(), practiceCaseIdParamsSchema)
    if (!params.ok) {
      return error(c, params.error, practiceErrorHttpStatus(params.error.code))
    }
    const body = await parseJsonBody(c, practiceAssociationOrderBodySchema)
    if (!body.ok) {
      return error(c, body.error, practiceErrorHttpStatus(body.error.code))
    }

    const result = await repository.reorderAssociations(params.value.caseId, body.value.associationIds)
    if (!result.ok) {
      return error(c, result.error, practiceErrorHttpStatus(result.error.code))
    }
    return ok(c, result.value)
  })

  routes.patch("/cases/:caseId/associations/:associationId/hidden", async (c) => {
    const params = parseRouteParams(c.req.param(), practiceCaseAssociationParamsSchema)
    if (!params.ok) {
      return error(c, params.error, practiceErrorHttpStatus(params.error.code))
    }
    const body = await parseJsonBody(c, practiceAssociationHiddenBodySchema)
    if (!body.ok) {
      return error(c, body.error, practiceErrorHttpStatus(body.error.code))
    }

    const result = await repository.setAssociationHiddenFromPractice(
      params.value.caseId,
      params.value.associationId,
      body.value.hiddenFromPractice,
    )
    if (!result.ok) {
      return error(c, result.error, practiceErrorHttpStatus(result.error.code))
    }
    return ok(c, result.value)
  })

  routes.delete("/cases/:caseId/associations/:associationId", async (c) => {
    const params = parseRouteParams(c.req.param(), practiceCaseAssociationParamsSchema)
    if (!params.ok) {
      return error(c, params.error, practiceErrorHttpStatus(params.error.code))
    }

    const result = await repository.deleteAssociation(params.value.caseId, params.value.associationId)
    if (!result.ok) {
      return error(c, result.error, practiceErrorHttpStatus(result.error.code))
    }
    return ok(c, result.value)
  })

  return routes
}

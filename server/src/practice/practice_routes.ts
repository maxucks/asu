import { created, error, noContent, ok } from "@/core/hono_response"
import { parseJsonBody, parseQuery, parseRouteParams } from "@/core/validate_request"
import { log } from "@/core/logger"
import { practiceErrorHttpStatus } from "@/practice/practice_errors"
import {
  practiceAssociationHiddenBodySchema,
  practiceAssociationImageUrlBodySchema,
  practiceAssociationTextBodySchema,
  practiceCaseAssociationParamsSchema,
  practiceCaseIdParamsSchema,
  practiceCreateCaseBodySchema,
  practiceCreateLanguageBodySchema,
  practiceLanguageIdParamsSchema,
  practiceQueueQuerySchema,
  practiceUpdateLanguageBodySchema,
  practiceUpdateCaseBodySchema,
} from "@/practice/practice_route_schemas"
import type { PracticeRepository } from "@/practice/practice_repository"
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

  routes.post("/cases/:caseId/associations/text", async (c) => {
    const params = parseRouteParams(c.req.param(), practiceCaseIdParamsSchema)
    if (!params.ok) {
      return error(c, params.error, practiceErrorHttpStatus(params.error.code))
    }
    const body = await parseJsonBody(c, practiceAssociationTextBodySchema)
    if (!body.ok) {
      return error(c, body.error, practiceErrorHttpStatus(body.error.code))
    }

    const result = await repository.appendTextAssociation(params.value.caseId, body.value.text)
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

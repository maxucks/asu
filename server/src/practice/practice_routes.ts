import { error, ok } from "@/core/hono_response"
import { parseJsonBody, parseRouteParams } from "@/core/validate_request"
import { log } from "@/core/logger"
import { practiceErrorHttpStatus } from "@/practice/practice_errors"
import {
  practiceAssociationHiddenBodySchema,
  practiceAssociationImageUrlBodySchema,
  practiceAssociationTextBodySchema,
  practiceCaseAssociationParamsSchema,
  practiceCaseIdParamsSchema,
} from "@/practice/practice_route_schemas"
import type { PracticeRepository } from "@/practice/practice_repository"
import { Hono } from "hono"

export function createPracticeRoutes(repository: PracticeRepository) {
  const routes = new Hono()

  routes.get("/queue", async (c) => {
    const result = await repository.getQueue()
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

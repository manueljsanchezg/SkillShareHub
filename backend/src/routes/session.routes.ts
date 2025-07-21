import { FastifyInstance } from "fastify";
import { actionSessionschema } from "../schemas/session.schema";
import { actionSession, getMySessions, getSessions } from "../controller/session.controller";
import { checkRole } from "../middlewares/authMiddleware";
import { Role } from "@prisma/client";

export default async function sessionRoutes(fastify: FastifyInstance) {

    fastify.get("/my-sessions", { onRequest: [checkRole(Role.USER)] }, getMySessions)
    fastify.get("", getSessions)
    fastify.patch("/:id/:action", { schema: actionSessionschema, onRequest: [checkRole(Role.USER)] }, actionSession)
}


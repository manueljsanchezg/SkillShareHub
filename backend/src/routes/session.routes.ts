import { FastifyInstance } from "fastify";
import { actionSessionschema } from "../schemas/session.schema";
import { actionSession, getMySessions, getSessions } from "../controller/session.controller";
import { checkRole } from "../middlewares/auth.middleware";
import { Role } from "@prisma/client";
import { loadSession, validateActions, validateReceiverUser, validateSessionStatus, validateUserNotSessionOwner } from "../middlewares/session.middleware";

export default async function sessionRoutes(fastify: FastifyInstance) {

    fastify.get("/my-sessions",
        {
            onRequest: [
                checkRole(Role.USER)
            ]
        },
        getMySessions)

    fastify.get("/",
        {
            onRequest: [
                checkRole(Role.USER)
            ]
        },
        getSessions)

    fastify.put("/:id/:action",
        {
            schema: actionSessionschema,
            onRequest: [
                checkRole(Role.USER),
                validateActions,
                validateReceiverUser,
                loadSession,
                validateUserNotSessionOwner,
                validateSessionStatus
            ]
        },
        actionSession)
}


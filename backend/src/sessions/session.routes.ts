import { FastifyInstance } from "fastify";
import { actionSessionschema, getSessionsSchema } from "./session.schema";
import { actionSession, getMySessions, getSessions } from "./session.controller";
import { checkRole } from "../auth/auth.middleware";
import { Role } from "@prisma/client";
import { loadSession, validateActions, validateReceiverUser, validateSessionStatus, validateUserNotSessionOwner } from "./session.middleware";

export default async function sessionRoutes(fastify: FastifyInstance) {

    fastify.get("/my-sessions",
        {
            schema: getSessionsSchema,
            onRequest: [
                checkRole(Role.USER)
            ]
        },
        getMySessions)

    fastify.get("/",
        {
            schema: getSessionsSchema,
            onRequest: [
                checkRole(Role.ADMIN)
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


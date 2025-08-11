import { FastifyInstance } from "fastify"
import { getTagSchema } from "./tag.schema"
import { Role } from "@prisma/client"
import { checkRole } from "../auth/auth.middleware"
import { deleteTag, getTag, getTags } from "./tag.controller"

export default async function tagRoutes(fastify: FastifyInstance) {

    fastify.get("/",
        {
            schema: getTagSchema,
            onRequest: [
                checkRole(Role.ADMIN)
            ]
        },
        getTags)

    fastify.get("/:id",
        {
            schema: getTagSchema,
            onRequest: [
                checkRole(Role.ADMIN)
            ]
        },
        getTag)

    fastify.delete("/:id",
        {
            schema: getTagSchema,
            onRequest: [
                checkRole(Role.ADMIN)
            ]
        },
        deleteTag)

}
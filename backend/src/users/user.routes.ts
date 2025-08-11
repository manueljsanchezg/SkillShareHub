import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { checkRole } from "../auth/auth.middleware";
import { getProfile, getUser, getUsers } from "./user.controller";
import { deleteUserSchema, getUsersSchema } from "./user.schema";
import { Role } from "@prisma/client";

export default async function userRoutes(fastify: FastifyInstance) {

    fastify.get("/prueba", async (request: FastifyRequest, reply: FastifyReply) => {
        console.log(request.user)
        return reply.send("Hola mundo")
    })

    fastify.get("/",
        {
            schema: getUsersSchema,
            onRequest: [
                checkRole(Role.ADMIN)
            ]
        },
        getUsers)

    fastify.get("/:id",
        {
            schema: getUsersSchema,
            onRequest: [
                checkRole(Role.ADMIN)
            ]
        },
        getUser)

    fastify.get("/profile",
        {
        },
        getProfile)

    fastify.delete("/:id",
        {
            schema: deleteUserSchema,
            onRequest: [
                checkRole(Role.ADMIN)
            ]
        },
        getUser)

}
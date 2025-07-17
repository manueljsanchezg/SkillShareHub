import { FastifyInstance } from "fastify"
import { createSkill } from "../controller/skill.controller"
import { authenticate, checkRole } from "../middlewares/authMiddleware"
import { Role } from "@prisma/client"


export default async function skillRoutes(fastify: FastifyInstance) {

    fastify.post("/", { onRequest: [checkRole(Role.USER)] }, createSkill)
}
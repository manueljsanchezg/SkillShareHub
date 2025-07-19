import { FastifyInstance } from "fastify"
import { createSkill, getSkills, getSkill, updateSkill } from "../controller/skill.controller"
import { checkRole } from "../middlewares/authMiddleware"
import { Role } from "@prisma/client"
import { createSkillSchema, getSkillSchema, updateSkillSchema } from "../schemas/skill.schema"


export default async function skillRoutes(fastify: FastifyInstance) {

    fastify.get("/", { onRequest: [checkRole(Role.USER)] }, getSkills)
    fastify.get("/:id", { schema: getSkillSchema, onRequest: [checkRole(Role.USER)] }, getSkill)
    fastify.post("/", { schema: createSkillSchema, onRequest: [checkRole(Role.USER)] }, createSkill)
    fastify.put("/:id", { schema: updateSkillSchema, onRequest: [checkRole(Role.USER)] }, updateSkill)
}
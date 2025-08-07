import { FastifyInstance } from "fastify"
import { createSkill, getSkills, getSkill, updateSkill, deleteSkill } from "../controller/skill.controller"
import { checkRole } from "../middlewares/auth.middleware"
import { Role } from "@prisma/client"
import { createSkillSchema, getSkillSchema, updateSkillSchema } from "../schemas/skill.schema"
import { requestSession } from "../controller/session.controller"
import { requestSessionschema } from "../schemas/session.schema"
import { loadSkill, validateRequestor, validateUserNotSkillOwner } from "../middlewares/session.middleware"


export default async function skillRoutes(fastify: FastifyInstance) {

    fastify.get("/",
        {
            onRequest: [
                checkRole(Role.USER)
            ]
        },
        getSkills)

    fastify.get("/:id", 
        { 
            schema: getSkillSchema,
             onRequest: [
                checkRole(Role.USER)
            ] 
        }, 
        getSkill)

    fastify.post("/", 
        { 
            schema: createSkillSchema, 
            onRequest: [
                checkRole(Role.USER)
            ] 
        }, 
        createSkill)

    fastify.put("/:id", 
        { 
            schema: updateSkillSchema
            , onRequest: [
                checkRole(Role.USER)
            ] 
        }, 
        updateSkill)

    fastify.delete("/:id",
        {
            onRequest: [
                checkRole(Role.USER)
            ]
        },
        deleteSkill)

    fastify.post("/:id/request-session",
        {
            schema: requestSessionschema,
            onRequest: [
                checkRole(Role.USER),
                loadSkill,
                validateUserNotSkillOwner,
                validateRequestor
            ]
        },
        requestSession)
}
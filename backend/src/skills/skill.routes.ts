import { FastifyInstance } from "fastify"
import { createSkill, getSkills, getSkill, updateSkill, deleteSkill } from "./skill.controller"
import { checkRole } from "../auth/auth.middleware"
import { Role } from "@prisma/client"
import { createSkillSchema, getSkillSchema, getSkillsSchema, updateSkillSchema } from "./skill.schema"
import { getSessionsReceived, requestSession } from "../sessions/session.controller"
import { requestSessionschema } from "../sessions/session.schema"
import { loadSkill, validateDate, validateOneSessionPerDay, validateRequestor, validateUserNotSkillOwner } from "../sessions/session.middleware"
import { loadSkillToUpdate, validateSkillOwner } from "./skill.middleware"


export default async function skillRoutes(fastify: FastifyInstance) {

    fastify.get("/",
        {
            schema: getSkillsSchema,
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
                checkRole(Role.USER),
                loadSkillToUpdate,
                validateSkillOwner
            ] 
        }, 
        updateSkill)

    fastify.delete("/:id",
        {
            schema: getSkillSchema,
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
            ],
            preValidation: [
                validateDate,
                validateOneSessionPerDay
            ]
        },
        requestSession)

        fastify.get("/:id/sessions-received",
        {
            onRequest: [
                checkRole(Role.USER),
                validateSkillOwner
            ]
        },
        getSessionsReceived)
}
import { FastifyReply, FastifyRequest } from "fastify"
import { skillRepository } from "../database/db"

export const loadSkill = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as { id: string }

        const skillToUpdate = await skillRepository.findUnique({ where: { id: +id }, include: { tags: true } })

        if (!skillToUpdate) return reply.status(404).send({ message: "Skill not found" })

        request.skillToUpdate = skillToUpdate
    } catch (error) {
        return reply.status(500).send({ message: "Internal Server Error", error })
    }
}

// Comment

export const validateSkillOwner = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as { id: string }

        const skillToUpdate = await skillRepository.findUnique({ where: { id: +id }, include: { tags: true } })

        if (!skillToUpdate) return reply.status(404).send({ message: "Skill not found" })

        request.skillToUpdate = skillToUpdate
    } catch (error) {
        return reply.status(500).send({ message: "Internal Server Error", error })
    }
}
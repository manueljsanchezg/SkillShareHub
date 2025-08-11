import { FastifyReply, FastifyRequest } from "fastify"
import { tagRepository } from "../database/db"
import { getPagination } from "../utils/functions"

export const getTags = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { page, pageSize } = request.query as { page: string, pageSize: string }

        const pagination = getPagination(page, pageSize) || {}

        const tags = await tagRepository.findMany({
            ...pagination
        })

        return reply.status(200).send(tags)
    } catch (error) {
        return reply.status(500).send({ message: "Internal Server Error", error })
    }
}

export const getTag = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as { id: string }

        const tag = await tagRepository.findUnique({ where: { id: +id } })

        if (!tag) return reply.status(404).send({ message: "Tag not found" })

        return reply.status(200).send(tag)
    } catch (error) {
        return reply.status(500).send({ message: "Internal Server Error", error })
    }
}

export const deleteTag = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as { id: string }

        const tagsDeleted = await tagRepository.deleteMany({ where: { id: +id } })

        if(tagsDeleted.count < 1) return reply.status(404).send({ message: "Tag not found" })

        return reply.status(200).send("Tag succesfully deleted")
    } catch (error) {
        return reply.status(500).send({ message: "Internal Server Error", error })
    }
}
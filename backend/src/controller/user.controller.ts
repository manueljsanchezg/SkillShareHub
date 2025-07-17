import { FastifyReply, FastifyRequest } from "fastify";
import { userRepository } from "../database/db";

export const getUsers = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { page, pageSize } = request.query as { page: string, pageSize: string }

        if (+page === 0 || +pageSize === 0) return reply.status(400).send({ message: "Page and PageSize must be greater than zero" })

        const users = await userRepository.findMany({
            skip: (+page - 1) * +pageSize,
            take: +pageSize
        })

        return reply.status(200).send(users)
    } catch (error) {
        return reply.status(500).send({ message: "Internal Server Error", error })
    }
}

export const getUser = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { userId } = request.params as { userId: string }

        const user = await userRepository.findUnique({ where: { id: +userId } })

        return reply.status(200).send(user)
    } catch (error) {
        return reply.status(500).send({ message: "Internal Server Error" })
    }
}
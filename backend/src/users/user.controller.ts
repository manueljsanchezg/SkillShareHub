import { FastifyReply, FastifyRequest } from "fastify";
import { userRepository } from "../database/db";
import { getPagination } from "../utils/functions";

export const getUsers = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { page, pageSize } = request.query as { page: string, pageSize: string }

        const pagination = getPagination(page, pageSize) || {}

        const users = await userRepository.findMany({
            ...pagination
        })

        return reply.status(200).send(users)
    } catch (error) {
        return reply.status(500).send({ message: "Internal Server Error", error })
    }
}

export const getUser = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as { id: string }

        const user = await userRepository.findUnique({ where: { id: +id } })

        if (!user) return reply.status(404).send({ message: "User not found" })

        return reply.status(200).send(user)
    } catch (error) {
        return reply.status(500).send({ message: "Internal Server Error", error })
    }
}

export const getProfile = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { userId } = request.user as { userId: string }

        const user = await userRepository.findUnique({ 
            where: { id: +userId }, 
            select: {
                name: true,
                surname: true,
                birthDate: true,
                email: true,
                wallet: {
                    select: {
                        tokens: true
                    }
                }
            }
        })

        if (!user) return reply.status(404).send({ message: "User not found" })

        return reply.status(200).send(user)
    } catch (error) {
        return reply.status(500).send({ message: "Internal Server Error", error })
    }
}

export const deleteUser = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as { id: string }

        const usersDeleted = await userRepository.deleteMany({ where: { id: +id } })

        if(usersDeleted.count < 1) return reply.status(404).send({ message: "User not found" })

        return reply.status(200).send("User succesfully deleted")
    } catch (error) {
        return reply.status(500).send({ message: "Internal Server Error", error })
    }
}
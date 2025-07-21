import { FastifyReply, FastifyRequest } from "fastify";
import { sessionRepository, skillRepository } from "../database/db";
import { Status } from "@prisma/client";


export const getMySessions = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { page, pageSize } = request.query as { page?: string, pageSize?: string }
        const { userId } = request.user as { userId: string }

        if (!page || !pageSize) {

            const mySessions = await sessionRepository.findMany({
                where: {
                    userId: +userId
                }
            })

            return reply.status(200).send(mySessions)
        }

        const mySessions = await sessionRepository.findMany({
            skip: (+page - 1) * +pageSize,
            take: +pageSize,
            where: {
                userId: +userId
            }
        })

        return reply.status(200).send(mySessions);
    } catch (error) {
        return reply.status(500).send({ message: "Internal Server Error", error })
    }
}

export const getSessions = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { page, pageSize } = request.query as { page?: string, pageSize?: string }
        const { userId } = request.user as { userId: string }

        if (!page || !pageSize) {

            const sessions = await sessionRepository.findMany({
                where: {
                    userId: {
                        not: +userId
                    }
                }
            })

            return reply.status(200).send(sessions)
        }

        const sessions = await sessionRepository.findMany({
            skip: (+page - 1) * +pageSize,
            take: +pageSize,
            where: {
                userId: {
                    not: +userId
                }
            }
        })

        return reply.status(200).send(sessions);
    } catch (error) {
        return reply.status(500).send({ message: "Internal Server Error", error })
    }

}


export const requestSession = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { date } = request.body as { date: string }
        const { id } = request.params as { id: string }
        const { userId } = request.user as { userId: string }

        const skill = await skillRepository.findUnique({ where: { id: +id }, include: { user: true } })

        if (!skill) return reply.status(404).send({ message: "Skill not found" })

        if (+userId === skill.user.id) return reply.status(403).send({ message: "Unauthorized" })

        const newSession = await sessionRepository.create({
            data: {
                date: new Date(date),
                status: Status.PENDING,
                userId: +userId,
                skillId: +id
            }
        })

        return reply.status(200).send(newSession);
    } catch (error) {
        return reply.status(500).send({ message: "Internal Server Error", error })
    }
}

export const actionSession = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id, action } = request.params as { id: string, action: string }
        const { userId } = request.user as { userId: string }

        const validActions = ["accepted", "rejected"]

        if (!validActions.includes(action)) {
            return reply.status(403).send({ message: "Action not found" })
        }

        const session = await sessionRepository.findUnique({
            where: { id: +id },
            include: {
                skill: true
            }
        })

        if (!session) return reply.status(404).send({ message: "Session not found" })

        if (session.skill.userId !== +userId) {
            return reply.status(401).send({ message: "Unauthorized" })
        }

        if (session.status !== Status.PENDING) {
            return reply.status(400).send({ message: "Session already handled" })
        }

        const updatedSession = await sessionRepository.update({
            where: {
                id: +id
            },
            data: {
                status: action === "accepted" ? Status.ACCEPTED : Status.REJECTED
            }
        })

        return reply.status(200).send(updatedSession);
    } catch (error) {
        return reply.status(500).send({ message: "Internal Server Error", error })
    }
}
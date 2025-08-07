import { FastifyReply, FastifyRequest } from "fastify";
import { sessionRepository, skillRepository, userRepository } from "../database/db";
import { SessionStatus, User, Wallet } from "@prisma/client";

/* Request session middlewares*/

export const loadSkill = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as { id: string }

        const skill = await skillRepository.findUnique({ where: { id: +id }, include: { user: true } })

        if (!skill) return reply.status(404).send({ message: "Skill not found" })

        request.skill = skill;
    } catch (error) {
        return reply.status(500).send({ message: "Internal Server Error", error })
    }
}

export const validateUserNotSkillOwner = async (request: FastifyRequest, reply: FastifyReply) => {
    const { userId } = request.user as { userId: string }

    if (+userId === request.skill?.user.id) return reply.status(403).send({ message: "Unauthorized" })
}

export const validateRequestor = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { userId } = request.user as { userId: string }

        const skill = request.skill!

        const user = await userRepository.findUnique({ where: { id: +userId }, include: { wallet: true } })

        if (!user || !user.wallet) return reply.status(404).send({ message: "User nor found" })

        if (user.wallet?.tokens < skill.tokens) return reply.status(403).send({ message: "Not enough tokens" })

        request.requestor = user as User & { wallet: Wallet }
    } catch (error) {
        return reply.status(500).send({ message: "Internal Server Error", error })
    }
}

/* Action session middlewares*/

export const validateActions = async (request: FastifyRequest, reply: FastifyReply) => {
    const { action } = request.params as { id: string, action: string }

    const parsedAction = action.toLocaleLowerCase()

    const validActions = ["accepted", "rejected"]

    if (!validActions.includes(parsedAction)) {
        return reply.status(403).send({ message: "Action not found" })
    }

    request.action = parsedAction
}

export const validateReceiverUser = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { userId } = request.user as { userId: string }

        const user = await userRepository.findUnique({ where: { id: +userId }, include: { wallet: true } })

        if (!user || !user.wallet) return reply.status(404).send({ message: "User nor found" })
    } catch (error) {
        return reply.status(500).send({ message: "Internal Server Error", error })
    }
}

export const loadSession = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as { id: string }

        const session = await sessionRepository.findUnique({
            where: { id: +id },
            include: {
                skill: {
                    include: {
                        user: {
                            include: {
                                wallet: true
                            }
                        }
                    }
                },
                tokenReservation: true,
                user: {
                    include: {
                        wallet: true
                    }
                }
            }
        })

        if (!session || !session.user.wallet || !session.skill.user.wallet) return reply.status(404).send({ message: "Session not found" })

        request.extendedSession = session;
    } catch (error) {
        return reply.status(500).send({ message: "Internal Server Error", error })
    }
}

export const validateUserNotSessionOwner = async (request: FastifyRequest, reply: FastifyReply) => {
    const { userId } = request.user as { userId: string }

    const session = request.extendedSession!

    if (session.skill.userId !== +userId) return reply.status(401).send({ message: "Unauthorized" })
}

export const validateSessionStatus = async (request: FastifyRequest, reply: FastifyReply) => {

    const extendedSession = request.extendedSession!

    if (extendedSession.session?.status !== SessionStatus.PENDING) return reply.status(400).send({ message: "Session already handled" })
}
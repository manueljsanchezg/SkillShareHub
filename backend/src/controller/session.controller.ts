import { FastifyReply, FastifyRequest } from "fastify";
import { prisma, sessionRepository, skillRepository, tokenReservationRepository, transactionRepository, userRepository, walletRepository } from "../database/db";
import { Prisma, ReservationTokenStatus, Session, SessionStatus, Skill, User, Wallet } from "@prisma/client";
import { getPagination } from "../utils/functions";


export const getMySessions = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { page, pageSize } = request.query as { page?: string, pageSize?: string }
        const { userId } = request.user as { userId: string }

        const pagination = getPagination(page, pageSize) || {}

        const mySessions = await sessionRepository.findMany({
            ...pagination,
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

        const pagination = getPagination(page, pageSize) || {}

        const sessions = await sessionRepository.findMany({
            ...pagination,
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
        const { userId } = request.user as { userId: string }

        const skill = request.skill!

        const requestor = request.requestor!

        const newSession = requestSessionTransaction(skill, date, +userId, requestor.wallet)

        return reply.status(200).send(newSession);
    } catch (error) {
        return reply.status(500).send({ message: "Internal Server Error", error })
    }
}

async function requestSessionTransaction(
    skill: Skill,
    date: string,
    userId: number, requestorWalltet: Wallet
) {
    const newSession = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const newSession = await tx.session.create({
            data: {
                title: `${skill.name}-${date.slice(0, 16).replace("T", " ")}`,
                date: new Date(date),
                status: SessionStatus.PENDING,
                userId: +userId,
                skillId: skill.id
            }
        })

        await tx.wallet.update({
            where: {
                userId: +userId
            },
            data: {
                tokens: requestorWalltet.tokens - skill.tokens
            }
        })

        await tx.tokenReservation.create({
            data: {
                tokens: skill.tokens,
                userId: +userId,
                sessionId: newSession.id
            }
        })

        return newSession
    })
    return newSession
}

export const actionSession = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as { id: string }

        const action = request.action!

        const session = request.extendedSession!

        const senderWallet = session.user.wallet!

        const receiverWallet = session.skill.user.wallet!

        const updatedSession = actionSessionTransaction(+id, action, session.skill.tokens, senderWallet, receiverWallet)

        return reply.status(200).send(updatedSession);
    } catch (error) {
        return reply.status(500).send({ message: "Internal Server Error", error })
    }
}

async function actionSessionTransaction(
    id: number,
    action: string,
    tokens: number,
    senderWallet: Wallet,
    receiverWallet: Wallet
) {
    const updatedSession = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const updatedSession = await tx.session.update({
            where: {
                id: id
            },
            data: {
                status: action === "accepted" ? SessionStatus.ACCEPTED : SessionStatus.REJECTED
            }
        })

        await tx.tokenReservation.update({
            where: {
                sessionId: id
            },
            data: {
                status: action === "accepted" ? ReservationTokenStatus.COMPLETED : ReservationTokenStatus.RETURNED
            }
        })

        if (action === "accepted") {
            await tx.transaction.create({
                data: {
                    tokens: tokens,
                    senderWalletId: senderWallet.id,
                    receiverWalletId: receiverWallet.id,
                    sessionId: id
                }
            })

            await tx.wallet.update({
                where: {
                    userId: receiverWallet.userId
                },
                data: {
                    tokens: receiverWallet.tokens + tokens
                }
            })
        } else {
            await tx.wallet.update({
                where: {
                    userId: senderWallet.userId
                },
                data: {
                    tokens: senderWallet.tokens + tokens
                }
            })
        }

        return updatedSession
    })

    return updatedSession
}
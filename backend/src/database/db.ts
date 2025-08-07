import { PrismaClient } from "@prisma/client"

export const prisma = new PrismaClient()

export const userRepository = prisma.user
export const skillRepository = prisma.skill
export const tagRepository = prisma.tag
export const sessionRepository = prisma.session
export const transactionRepository = prisma.transaction
export const walletRepository = prisma.wallet
export const tokenReservationRepository = prisma.tokenReservation
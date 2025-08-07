import 'fastify'
import { Session, Skill, Tag, TokenReservation, User, Wallet } from "@prisma/client"

declare module 'fastify' {
    interface FastifyRequest {
        skill?: Skill & { user: User },
        extendedSession?: extendedSession,
        requestor?: User & { wallet: Wallet },
        action?: string,
        skillToUpdate?: Skill & { tags: Tag[] }
    }
}

type extendedSession = {
    session?: Session
    skill: Skill & {
        user: User & { 
            wallet: Wallet | null 
        }
    }
    user: User & { 
        wallet: Wallet | null 
    }
    tokenReservation: TokenReservation | null
}

export {}
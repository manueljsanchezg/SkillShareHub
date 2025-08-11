import { Role } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    const decoded = await request.jwtVerify();
    request.user = decoded
  } catch {
    return reply.status(401).send({ message: "Unauthorized" });
  }
}

export function checkRole(requiredRole: Role) {
  return async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      const { role } = request.user as { role: Role }

      if(!role || role !== requiredRole) return reply.status(401).send({ message: "Unauthorized" })

    } catch (error) {
      return reply.status(401).send({ message: "Unauthorized", error });
    }
  }
}

export const validateBirthDate = async (request: FastifyRequest, reply: FastifyReply) => {
    const { birthDate } = request.body as { birthDate: string }

    const birth = new Date(birthDate)

    const now = new Date()

    if(birth > now) return reply.status(400).send({ message: "Birth date must be before than now" })
}
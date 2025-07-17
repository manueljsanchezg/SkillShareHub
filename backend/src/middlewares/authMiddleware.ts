import { Role } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import { userRepository } from "../database/db";

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
      return reply.status(401).send({ message: "Unauthorized" });
    }
  }
}
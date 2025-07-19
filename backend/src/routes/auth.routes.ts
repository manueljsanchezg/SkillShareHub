import { FastifyInstance } from "fastify";
import { loginUser, registerUser } from "../controller/auth.controller";
import { loginUserSchema, registerUserSchema } from "../schemas/auth.schema";

export default async function authRoutes(fastify: FastifyInstance) {

    fastify.post("/register", { schema: registerUserSchema }, registerUser)
    fastify.post("/login", { schema: loginUserSchema }, loginUser)
}
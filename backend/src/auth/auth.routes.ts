import { FastifyInstance } from "fastify";
import { loginUser, registerUser } from "../auth/auth.controller";
import { loginUserSchema, registerUserSchema } from "./auth.schema";
import { validateBirthDate } from "./auth.middleware";

export default async function authRoutes(fastify: FastifyInstance) {

    fastify.post("/register",
        {
            schema: registerUserSchema,
            preValidation: [
                validateBirthDate
            ]
        },
        registerUser)
        
    fastify.post("/login",
        {
            schema: loginUserSchema
        }
        , loginUser)
}
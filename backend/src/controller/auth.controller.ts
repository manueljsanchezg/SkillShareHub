import { FastifyReply, FastifyRequest } from "fastify";
import { userRepository, walletRepository } from "../database/db";
import { UserI } from "../types/userInterfaces";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

export const registerUser = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { name, surname, birthDate, email, password, role } = request.body as UserI

        const userExists = await userRepository.findUnique({ where: { email } })

        if (userExists) return reply.status(403).send({ message: "This email is already used" })

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await userRepository.create({
            data: {
                name,
                surname,
                birthDate: new Date(birthDate),
                email,
                password: hashedPassword,
                role
            },
        })

        await walletRepository.create({
            data: {
                amount: 0,
                userId: newUser.id
            }
        })

        return reply.status(201).send({ message: "User created" })
    } catch (error) {
        return reply.status(500).send({ message: "Internal Server Error" })
    }
}

export const loginUser = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { email, password } = request.body as { email: string, password: string }

        const userExists = await userRepository.findUnique({ where: { email } })

        if (!userExists) return reply.status(401).send({ message: "Invalid email or password " })

        const isValidPassword = await bcrypt.compare(password, userExists.password)

        if (!isValidPassword) return reply.status(401).send({ message: "Invalid email or password " })

        const payload = { userId: userExists.id, email: userExists.email, role: userExists.role }

        const jwtToken = jwt.sign(payload, 'secret', { expiresIn: '1h' })

        return reply.status(200).send({ message: "User logged", jwtToken })
    } catch (error) {
        return reply.status(500).send({ message: "Internal Server Error" })
    }
}
import { FastifyReply, FastifyRequest } from "fastify";
import { prisma, skillRepository } from "../database/db.ts";
import { SkillI, Tag } from "../types/skillInterfaces";
import { Prisma, Skill } from "@prisma/client";
import { getPagination } from "../utils/functions.ts";

export const getSkills = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { page, pageSize } = request.query as { page?: string, pageSize?: string }

        const skills = await skillRepository.findMany({
            ...getPagination(page, pageSize),
            include: {
                tags: true
            }
        })

        return reply.status(200).send(skills)
    } catch (error) {
        return reply.status(500).send({ message: "Internal Server Error", error })
    }
}

export const getSkill = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as { id: string }

        const skill = await skillRepository.findUnique({
            where: { id: Number(id) }, include: {
                tags: true
            }
        })

        if (!skill) return reply.status(404).send({ message: "Skill not found" })

        return reply.status(200).send(skill)
    } catch (error) {
        return reply.status(500).send({ message: "Internal Server Error", error })
    }
}

export const createSkill = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { userId } = request.user as { userId: string }

        const skill = request.body as SkillI

        const normalizedTags = skill.tags.map(t => t.trim().toUpperCase())

        const newSkill = await createSkillTransaction(skill, normalizedTags, +userId)

        return reply.status(201).send({ message: "Skill created", newSkill })
    } catch (error) {
        return reply.status(500).send({ message: "Internal Server Error", error })
    }
}

async function createSkillTransaction(skill: SkillI, normalizedTags: string[], userId: number) {
    const newSkill = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {

        const existingTags = await tx.tag.findMany({
            where: {
                name: {
                    in: normalizedTags
                }
            }
        })

        const noExistingTags = [...new Set(normalizedTags).difference(new Set(existingTags.map((t: { name: string }) => t.name)))]


        const newTags = await tx.tag.createManyAndReturn({
            data: noExistingTags.map(t => ({ name: t }))
        })

        const tagsToSkill = [...existingTags, ...newTags]


        const newSkill = await tx.skill.create({
            data: {
                name: skill.name,
                type: skill.type,
                description: skill.description || "",
                tokens: skill.tokens,
                userId: +userId,
                tags: {
                    connect: tagsToSkill.map(t => ({ id: t.id }))
                }
            }
        })
        return newSkill
    })

    return newSkill
}


export const updateSkill = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as { id: string }

        const { name, type, description = "", tokens, tags } = request.body as SkillI

        const skillToUpdate: Skill & { tags: Tag[] } = request.skillToUpdate!

        const updatedSkill = await updateSkillTransaction(+id, skillToUpdate, name, type, description, tokens, tags)

        return reply.status(200).send(updatedSkill)
    } catch (error) {
        return reply.status(500).send({ message: "Internal Server Error", error })
    }
}

async function updateSkillTransaction(
    id: number,
    skillToUpdate: Skill & { tags: Tag[] },
    name: string,
    type: string,
    description: string,
    tokens: number,
    tags: string[]
) {
    const updatedSkill = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        let tagsToSkill: Tag[] = []

        if (tags && tags.length > 0) {
            const normalizedTags = tags.map(t => t.trim().toUpperCase())

            const existingTags = await tx.tag.findMany({
                where: { name: { in: normalizedTags } }
            })

            const existingTagNames = new Set(existingTags.map((t: { name: string }) => t.name))
            const noExistingTags = normalizedTags.filter(t => !existingTagNames.has(t))

            const newTags = await tx.tag.createManyAndReturn({
                data: noExistingTags.map(t => ({ name: t }))
            })

            tagsToSkill = [...existingTags, ...newTags]
        }

        const dataToUpdate: any = {
            name: name ?? skillToUpdate.name,
            type: type ?? skillToUpdate.type,
            description: description ?? skillToUpdate.description,
            tokens: tokens ?? skillToUpdate.tokens
        }

        if (tags && tags.length > 0) {
            dataToUpdate.tags = {
                set: [], 
                connect: tagsToSkill.map(t => ({ id: t.id }))
            }
        }

        const updatedSkill = await tx.skill.update({
            where: {
                id: id
            },
            include: {
                tags: true
            }
            ,
            data: dataToUpdate
        })

        return updatedSkill
    })

    return updatedSkill

}


export const deleteSkill = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as { id: string }

        const result = await skillRepository.deleteMany({
            where: { id: +id }
        })

        if (result.count === 0) {
            return reply.status(401).send({ message: "Skill not found" })
        }

        return reply.status(200).send({ message: "Skill deleted" })
    } catch (error) {
        return reply.status(500).send({ message: "Internal Server Error", error })
    }
}
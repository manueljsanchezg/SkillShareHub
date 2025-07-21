import { FastifyReply, FastifyRequest } from "fastify";
import { prisma, skillRepository } from "../database/db.ts";
import { SkillI } from "../types/skillInterfaces";
import { Tag } from "@prisma/client";

export const createSkill = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { userId } = request.user as { userId: string }

        const { name, type, description = "", duration, tags } = request.body as SkillI

        const normalizedTags = tags.map(t => t.trim().toUpperCase())

        const newSkill = await prisma.$transaction(async (tx) => {

            const existingTags = await tx.tag.findMany({
                where: {
                    name: {
                        in: normalizedTags
                    }
                }
            })

            const noExistingTags = [...new Set(normalizedTags).difference(new Set(existingTags.map(t => t.name)))]


            const newTags = await tx.tag.createManyAndReturn({
                data: noExistingTags.map(t => ({ name: t }))
            })

            const tagsToSkill = [...existingTags, ...newTags]


            const newSkill = await tx.skill.create({
                data: {
                    name,
                    type,
                    description,
                    duration,
                    userId: +userId,
                    tags: {
                        connect: tagsToSkill.map(t => ({ id: t.id }))
                    }
                }
            })
            return newSkill
        })

        return reply.status(201).send({ message: "Skill created", newSkill })
    } catch (error) {
        return reply.status(500).send({ message: "Internal Server Error", error })
    }
}

export const getSkills = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { page, pageSize } = request.query as { page?: string, pageSize?: string }

        if (!page || !pageSize) {

            const skills = await skillRepository.findMany({
                include: {
                    tags: true
                }
            })

            return reply.status(200).send(skills)
        }

        const skills = await skillRepository.findMany({
            skip: (+page - 1) * +pageSize,
            take: +pageSize,
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

export const updateSkill = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as { id: string }

        const { name, type, description = "", duration, tags } = request.body as SkillI

        const skillToUpdate = await skillRepository.findUnique({ where: { id: +id }, include: { tags: true } })

        if (!skillToUpdate) return reply.status(404).send({ message: "Skill not found" })

        const updatedSkill = await prisma.$transaction(async (tx) => {
            let tagsToSkill: Tag[] = []

            if (tags && tags.length > 0) {
                const normalizedTags = tags.map(t => t.trim().toUpperCase())

                const existingTags = await tx.tag.findMany({
                    where: { name: { in: normalizedTags } }
                })

                const existingTagNames = new Set(existingTags.map(t => t.name))
                const noExistingTags = normalizedTags.filter(t => !existingTagNames.has(t))

                const newTags = await tx.tag.createManyAndReturn({
                    data: noExistingTags.map(t => ({ name: t }))
                })

                tagsToSkill = [...existingTags, ...newTags]
            }

            skillToUpdate.name = name ? name : skillToUpdate.name
            skillToUpdate.type = type ? type : skillToUpdate.type
            skillToUpdate.description = description ? description : skillToUpdate.description
            skillToUpdate.duration = duration ? duration : skillToUpdate.duration



            const updatedSkill = await tx.skill.update({
                where: {
                    id: +id
                },
                include: {
                    tags: true

                }
                ,
                data: {
                    name: skillToUpdate.name,
                    type: skillToUpdate.type,
                    description: skillToUpdate.description,
                    duration: skillToUpdate.duration,
                    tags: {
                        set: [],
                        connect: tagsToSkill.map(t => ({ id: t.id }))
                    }
                }
            })

            return updatedSkill
        })

        return reply.status(200).send(updatedSkill)
    } catch (error) {
        return reply.status(500).send({ message: "Internal Server Error", error })
    }
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
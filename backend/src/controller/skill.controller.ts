import { FastifyReply, FastifyRequest } from "fastify";
import { skillRepository, tagRepository } from "../database/db";
import { SkillI } from "../types/skillInterfaces";

export const createSkill = async (request: FastifyRequest, reply: FastifyReply) => {
    try {

        const { userId } = request.user as { userId: string }

        const { name, type, description = "", duration, tags } = request.body as SkillI

        const normalizedTags = tags.map(t => t.trim().toUpperCase())

        const existingTags = await tagRepository.findMany({
            where: {
                name: {
                    in: normalizedTags
                }
            }
        })

        const noExistingTags = [...new Set(normalizedTags).difference(new Set(existingTags.map(t => t.name)))]


        const newTags = await tagRepository.createManyAndReturn({
            data: noExistingTags.map(t => ({ name: t }))
        })

        const tagsToSkill = [...existingTags, ...newTags]


        const newSkill = await skillRepository.create({
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

        return reply.status(201).send({ message: "Skill created", newSkill })
    } catch (error) {
        return reply.status(500).send({ message: "Internal Server Error", error })
    }
}

export const getSkills = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { page, pageSize } = request.query as { page: string, pageSize: string }

        if (+page === 0 || +pageSize === 0) {

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

const getSkill = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { skillId } = request.params as { skillId: string }

        const skill = await skillRepository.findUnique({
            where: { id: +skillId }, include: {
                tags: true
            }
        })

        return reply.status(200).send(skill)
    } catch (error) {
        return reply.status(500).send({ message: "Internal Server Error", error })
    }
}

const updateSkill = async (request: FastifyRequest, reply: FastifyReply) {
    try {
        const { skillId } = request.params as { skillId: string }

        const { name, type, description = "", duration, tags } = request.body as SkillI

        const skillToUpdate = await skillRepository.findUnique({ where: { id: +skillId }, include: { tags: true } })

        if (!skillToUpdate) return reply.status(404).send({ message: "Skill not found" })

        const newData: Partial<SkillI> = {}

        const tags

        if (tags) {
            const normalizedTags = tags.map(t => t.trim().toUpperCase())

            const existingTags = await tagRepository.findMany({
                where: {
                    name: {
                        in: normalizedTags
                    }
                }
            })

            const noExistingTags = [...new Set(normalizedTags).difference(new Set(existingTags.map(t => t.name)))]


            const newTags = await tagRepository.createManyAndReturn({
                data: noExistingTags.map(t => ({ name: t }))
            })

            const tagsToSkill = [...existingTags, ...newTags]

        }

        skillToUpdate.name = name ? name : skillToUpdate.name
        skillToUpdate.type = type ? type : skillToUpdate.type
        skillToUpdate.description = description ? description : skillToUpdate.description
        skillToUpdate.duration = duration ? duration : skillToUpdate.duration



        const updatedSkill = skillRepository.update({
            where: { id: +skillId },
            data: {
                name: skillToUpdate.name,
                type: skillToUpdate.type,
                description: skillToUpdate.description,
                duration: skillToUpdate.duration,
                tags: {
                    connect: tagsToSkill.map(t => ({ id: t.id }))
                }
            }
        })

        return reply.status(200).send(updatedSkill)
    } catch (error) {
        return reply.status(500).send({ message: "Internal Server Error", error })
    }
}
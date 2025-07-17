

export interface SkillI {
    name: string,
    type: string,
    description?: string,
    duration: number,
    tags: string[]
}

export interface Tag {
    name: string
}


export interface SkillI {
    name: string,
    type: string,
    description?: string,
    tokens: number,
    tags: string[]
}

export interface Tag {
    id: any
    name: string
}
import S from "fluent-json-schema"

export const createSkillSchema = {
    body: S.object()
        .prop('name', S.string().maxLength(50).required())
        .prop('type', S.string().required())
        .prop('description', S.string())
        .prop('tokens', S.number().minimum(1).required())
        .prop('tags', S.array().items(S.string()))
}

export const getSkillSchema = {
    params: S.object()
        .prop('id', S.string().required())
}

export const updateSkillSchema = {
    body: S.object()
        .prop('name', S.string().maxLength(50))
        .prop('type', S.string())
        .prop('description', S.string())
        .prop('duration', S.number().minimum(1))
        .prop('tags', S.array().items(S.string())),
    params: S.object()
        .prop('id', S.string().required())
}
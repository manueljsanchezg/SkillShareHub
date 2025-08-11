import S from "fluent-json-schema"

const ROLES = {
    USER: 'USER',
    ADMIN: 'ADMIN'
}

export const registerUserSchema = {
    body: S.object()
        .prop('name', S.string().required())
        .prop('surname', S.string().required())
        .prop('birthDate', S.raw({ type: 'string', format: 'date' }).required())
        .prop('email', S.string().format(S.FORMATS.EMAIL).required())
        .prop('password', S.string().minLength(4).required())
        .prop('role', S.enum(Object.values(ROLES)).required())
}

export const loginUserSchema = {
    body: S.object()
        .prop('email', S.string().format(S.FORMATS.EMAIL).required())
        .prop('password', S.string().minLength(4).required())
}

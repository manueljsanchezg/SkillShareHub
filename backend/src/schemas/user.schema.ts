import S from "fluent-json-schema"

export const getUsersSchema = {
    querystring: S.object()
        .prop('page', S.string().required())
        .prop('pageSize', S.string().required())
}
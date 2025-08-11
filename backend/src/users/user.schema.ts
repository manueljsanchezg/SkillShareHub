import S from "fluent-json-schema"

export const getUsersSchema = {
    querystring: S.object()
        .prop('page', S.string().pattern("^\\d+$").required())
        .prop('pageSize', S.string().pattern("^\\d+$").required())
}

export const deleteUserSchema = {
    params: S.object()
        .prop('id', S.string().pattern("^\\d+$").required())
}
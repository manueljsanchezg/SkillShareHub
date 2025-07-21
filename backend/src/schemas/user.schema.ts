import S from "fluent-json-schema"

export const getUsersSchema = {
    querystring: S.object()
        .prop('page', S.string().pattern("^\\d+$").required())
        .prop('pageSize', S.string().pattern("^\\d+$").required())
}
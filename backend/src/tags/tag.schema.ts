import S from "fluent-json-schema";

export const getTagsSchema = {
    querystring: S.object()
            .prop('page', S.string().pattern("^\\d+$"))
            .prop('pageSize', S.string().pattern("^\\d+$"))
}

export const getTagSchema = {
    params: S.object()
        .prop('id', S.string().pattern("^\\d+$").required())
}
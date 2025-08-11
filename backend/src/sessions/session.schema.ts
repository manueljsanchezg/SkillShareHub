import S from "fluent-json-schema";

export const getSessionsSchema = {
    querystring: S.object()
            .prop('page', S.string().pattern("^\\d+$"))
            .prop('pageSize', S.string().pattern("^\\d+$"))
}


export const requestSessionschema = {
    body: S.object()
        .prop('date', S.string().format('date-time').required()),
    params: S.object()
        .prop('id', S.string().required()) 
}

export const actionSessionschema = {
    params: S.object()
        .prop('id', S.string().required())
        .prop('action', S.string().enum(['accepted', 'rejected']).required())
}
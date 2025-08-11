import fastify, { FastifyReply, FastifyRequest } from "fastify"
import fastifyJwt from "@fastify/jwt"
import userRoutes from "./users/user.routes"
import authRoutes from "./auth/auth.routes"
import skillRoutes from "./skills/skill.routes"
import sessionRoutes from "./sessions/session.routes"
import tagRoutes from "./tags/tag.routes"
import S from "fluent-json-schema"

const app = fastify({ logger: true, ajv: { customOptions: {
  removeAdditional: false
}} })

app.register(fastifyJwt, { secret: "secret" })

app.addHook("onRequest", async (request: FastifyRequest, reply: FastifyReply) => {
  try {

    console.log(request.url)

    if(request.url === "/api/v1/auth/login" || request.url === "/api/v1/auth/register") return

    const decoded = await request.jwtVerify()
    request.user = decoded
  } catch (error) {
    return reply.status(401).send({ message: "Unauthorized", error });
  }
})

const PREFIX = "/api/v1"

const schema = {
  body: S.object()
    .prop('name', S.string())
    .additionalProperties(false)
}

app.put('/api/v1/test', { schema }, async (req, reply) => {
  console.log('Request body:', req.body)
  return { msg: "ok" }
})

app.register(userRoutes, { prefix: `${PREFIX}/users` })
app.register(authRoutes, { prefix: `${PREFIX}/auth` })
app.register(skillRoutes, { prefix: `${PREFIX}/skills` })
app.register(sessionRoutes, { prefix: `${PREFIX}/sessions` })
app.register(tagRoutes, { prefix: `${PREFIX}/tags` })

export default app
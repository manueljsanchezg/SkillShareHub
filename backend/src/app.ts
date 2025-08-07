import fastify, { FastifyReply, FastifyRequest } from "fastify"
import fastifyJwt from "@fastify/jwt"
import userRoutes from "./routes/user.routes"
import authRoutes from "./routes/auth.routes"
import skillRoutes from "./routes/skill.routes"
import sessionRoutes from "./routes/session.routes"

const app = fastify({ logger: true })

app.register(fastifyJwt, { secret: 'secret' })

app.addHook("onRequest", async (request: FastifyRequest, reply: FastifyReply) => {
  try {

    if(request.url === "/api/v1/auth/login" || request.url === "/api/v1/auth/register") return

    const decoded = await request.jwtVerify()
    request.user = decoded
  } catch (error) {
    return reply.status(401).send({ message: "Unauthorized", error });
  }
})

app.register(userRoutes, { prefix: "/api/v1/users" })
app.register(authRoutes, { prefix: "/api/v1/auth" })
app.register(skillRoutes, { prefix: "/api/v1/skills" })
app.register(sessionRoutes, { prefix: "/api/v1/sessions" })

export default app
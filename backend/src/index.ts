import dotenv from "dotenv"
import { prisma } from './database/db'
import app from './app';

dotenv.config()

const PORT = Number(process.env.PORT) || 4000

const start = async () => {
  try {
    await prisma.$connect()
    console.log(`Prisma connected`)
    app.listen({ port: PORT });
    console.log(`Server running on PORT ${PORT}`)
  } catch (error) {
    console.error("Error al iniciar el servidor:", error)
    process.exit(1)
  }
}

start()
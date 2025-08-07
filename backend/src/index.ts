import { prisma } from './database/db'
import app from './app';

const PORT = 3000

const start = async () => {
  try {
    await prisma.$connect()
    console.log(`Prisma connected`)
    await app.listen({ port: PORT });
    console.log(`Server running on PORT ${PORT}`)
  } catch (error) {
    console.error("Error al iniciar el servidor:", error)
    process.exit(1)
  }
}

start()
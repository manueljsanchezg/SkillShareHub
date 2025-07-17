import { prisma } from './database/db'
import app from './app';

const PORT = 8080

const start = async () => {
  try {
    await prisma.$connect()
    console.log(`Prisma conectado con SQLite`)
    await app.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Server running on PORT ${PORT} and process ${process.pid}`)
  } catch (error) {
    console.error("Error al iniciar el servidor:", error)
    process.exit(1);
  }
}

start()
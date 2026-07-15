import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { config } from 'dotenv'

config({ path: '.env.local' })
const pool = new Pool({ connectionString: process.env.DB_STRING })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const images = await prisma.productImage.findMany()
  console.log(images)
}
main().then(() => prisma.$disconnect()).catch(console.error)

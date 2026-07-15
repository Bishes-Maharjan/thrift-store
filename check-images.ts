import { config } from 'dotenv'
config({ path: '.env.local' })

import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DB_STRING ?? process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DB_STRING or DATABASE_URL is required in .env.local')
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const total = await prisma.product.count()
  const withImages = await prisma.product.count({ where: { images: { some: {} } } })
  const imageCount = await prisma.productImage.count()
  const missing = await prisma.product.findMany({
    where: { images: { none: {} } },
    select: { name: true },
  })

  console.log('Products:', total)
  console.log('With images:', withImages)
  console.log('Without images:', total - withImages)
  console.log('Total images:', imageCount)
  if (missing.length > 0) {
    console.log('Missing:', missing.map((p) => p.name).join(', '))
  }
}

main()
  .then(() => prisma.$disconnect())
  .then(() => pool.end())
  .catch(console.error)

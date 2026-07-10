import { config } from 'dotenv'
config({ path: '.env.local' })
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcrypt'

const connectionString = process.env.DB_STRING
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash,
      name: 'Admin User',
      role: 'ADMIN',
    },
  })

  const category = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: {
      name: 'Electronics',
      slug: 'electronics',
    },
  })

  const product = await prisma.product.upsert({
    where: { slug: 'sample-product' },
    update: {},
    create: {
      name: 'Sample Smartphone',
      slug: 'sample-product',
      description: 'A great smartphone with advanced features.',
      categoryId: category.id,
      basePrice: 500,
      variants: {
        create: [
          {
            sku: 'SP-128GB-BLK',
            price: 500,
            stockQuantity: 10,
            attributes: { storage: '128GB', color: 'Black' },
          },
          {
            sku: 'SP-256GB-WHT',
            price: 600,
            stockQuantity: 5,
            attributes: { storage: '256GB', color: 'White' },
          },
        ],
      },
    },
  })

  console.log({ admin, category, product })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

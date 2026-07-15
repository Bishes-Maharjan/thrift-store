import { config } from 'dotenv'
config({ path: '.env.local' })

import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcrypt'
import { v2 as cloudinary } from 'cloudinary'

const USER_AGENT = 'THRIFT-Ecommerce-Seed/1.0 (local dev seed script)'

const connectionString = process.env.DB_STRING ?? process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DB_STRING or DATABASE_URL is required in .env.local')
}

for (const key of ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'] as const) {
  if (!process.env[key]) {
    throw new Error(`${key} is required in .env.local for image uploads`)
  }
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

type SeedProduct = {
  name: string
  description: string
  price: number
  imageSearches: string[]
}

type SeedCategory = {
  name: string
  slug: string
  products: SeedProduct[]
}

const SEED_CATEGORIES: SeedCategory[] = [
  {
    name: "Men's Clothing",
    slug: 'mens-clothing',
    products: [
      { name: 'Vintage Oxford Shirt', description: 'Crisp cotton oxford in light blue. Classic collar, single chest pocket.', price: 45, imageSearches: ['oxford shirt mens'] },
      { name: 'Wool Blazer', description: 'Structured navy blazer with notch lapels. Fully lined, two-button closure.', price: 85, imageSearches: ['mens wool blazer'] },
      { name: 'Graphic Band Tee', description: 'Soft faded cotton tee with vintage tour print. Relaxed fit.', price: 28, imageSearches: ['vintage band t-shirt'] },
      { name: 'Corduroy Trousers', description: 'Earth-tone corduroy pants with straight leg. Comfortable mid-rise waist.', price: 52, imageSearches: ['corduroy trousers'] },
      { name: 'Flannel Shirt', description: 'Red and black buffalo check flannel. Brushed cotton, button-down.', price: 38, imageSearches: ['flannel shirt mens'] },
      { name: 'Polo Shirt', description: 'Pique cotton polo in forest green. Three-button placket, ribbed collar.', price: 32, imageSearches: ['polo shirt mens clothing'] },
    ],
  },
  {
    name: "Women's Clothing",
    slug: 'womens-clothing',
    products: [
      { name: 'Silk Blouse', description: 'Flowing ivory silk blouse with tie neck. Elegant drape for day or evening.', price: 68, imageSearches: ['silk blouse womens'] },
      { name: 'Cashmere Sweater', description: 'Soft heather grey cashmere crewneck. Lightweight and warm.', price: 95, imageSearches: ['cashmere sweater'] },
      { name: 'Linen Summer Top', description: 'Breathable white linen tank with scalloped hem. Perfect for layering.', price: 35, imageSearches: ['linen top womens'] },
      { name: 'Knit Cardigan', description: 'Chunky oatmeal cardigan with patch pockets. Cozy oversized fit.', price: 58, imageSearches: ['knit cardigan womens'] },
      { name: 'Striped Breton Shirt', description: 'Classic navy and white horizontal stripes. Three-quarter sleeves.', price: 42, imageSearches: ['breton stripe shirt'] },
      { name: 'Merino Pullover', description: 'Fine-gauge merino wool pullover in burgundy. Minimal and versatile.', price: 72, imageSearches: ['merino wool sweater'] },
    ],
  },
  {
    name: 'Footwear',
    slug: 'footwear',
    products: [
      { name: 'Leather Ankle Boots', description: 'Brown distressed leather boots with side zip. Good tread, broken in.', price: 78, imageSearches: ['leather ankle boots'] },
      { name: 'Canvas Sneakers', description: 'Low-top white canvas sneakers. Clean classic style, lightly worn.', price: 35, imageSearches: ['canvas sneakers white'] },
      { name: 'Running Trainers', description: 'Lightweight mesh trainers in grey and neon accent. Cushioned sole.', price: 55, imageSearches: ['running shoes trainers'] },
      { name: 'Heeled Sandals', description: 'Block-heel tan leather sandals. Adjustable ankle strap.', price: 48, imageSearches: ['block heel sandals'] },
      { name: 'Suede Loafers', description: 'Penny loafers in tan suede. Hand-stitched moc toe.', price: 62, imageSearches: ['suede loafers'] },
      { name: 'Vintage High-Tops', description: 'Retro basketball-style high-tops in red and white. Iconic silhouette.', price: 65, imageSearches: ['vintage high top sneakers'] },
    ],
  },
  {
    name: 'Bags & Accessories',
    slug: 'bags-accessories',
    products: [
      { name: 'Leather Tote Bag', description: 'Structured cognac leather tote with interior zip pocket. Fits laptop.', price: 88, imageSearches: ['leather tote bag'] },
      { name: 'Crossbody Bag', description: 'Compact black crossbody with gold hardware. Adjustable strap.', price: 45, imageSearches: ['crossbody bag leather'] },
      { name: 'Vintage Wristwatch', description: 'Analog dress watch with leather strap. Minimal dial, working movement.', price: 120, imageSearches: ['vintage wristwatch leather strap'] },
      { name: 'Silk Scarf', description: 'Floral print silk square scarf. Hand-rolled edges, vibrant colors.', price: 38, imageSearches: ['silk scarf floral'] },
      { name: 'Leather Belt', description: 'Full-grain brown belt with brass buckle. 32mm width.', price: 32, imageSearches: ['leather belt brass buckle'] },
      { name: 'Retro Sunglasses', description: 'Cat-eye acetate frames with UV lenses. 1960s-inspired shape.', price: 42, imageSearches: ['vintage cat eye sunglasses'] },
    ],
  },
  {
    name: 'Vintage Denim',
    slug: 'vintage-denim',
    products: [
      {
        name: "Vintage Levi's 501 Jeans",
        description: 'Classic straight-leg 501s in medium wash. Button fly, five-pocket styling. Broken in just right.',
        price: 75,
        imageSearches: ["Levi's 501 jeans", 'vintage denim jeans', 'blue jeans fabric detail'],
      },
      { name: 'Denim Trucker Jacket', description: 'Medium wash trucker jacket with chest pockets. Timeless Levi\'s-style cut.', price: 68, imageSearches: ['denim trucker jacket'] },
      { name: 'High-Waist Mom Jeans', description: 'Light wash high-rise jeans with tapered leg. 90s revival fit.', price: 55, imageSearches: ['high waist mom jeans'] },
      { name: 'Denim Cutoff Shorts', description: 'Frayed hem cutoff shorts in stonewash blue. Summer staple.', price: 28, imageSearches: ['denim cutoff shorts'] },
      { name: 'Patchwork Jeans', description: 'Eclectic patchwork denim with mixed washes. One-of-a-kind artisan piece.', price: 82, imageSearches: ['patchwork denim jeans'] },
      { name: 'Wide Leg Jeans', description: 'Dark indigo wide-leg jeans with raw hem. Relaxed 70s silhouette.', price: 62, imageSearches: ['wide leg jeans denim'] },
    ],
  },
  {
    name: 'Outerwear',
    slug: 'outerwear',
    products: [
      { name: 'Classic Trench Coat', description: 'Khaki double-breasted trench with belt. Water-resistant cotton blend.', price: 110, imageSearches: ['trench coat khaki'] },
      { name: 'Puffer Jacket', description: 'Black quilted puffer with hood. Lightweight synthetic fill.', price: 75, imageSearches: ['black puffer jacket'] },
      { name: 'Leather Moto Jacket', description: 'Asymmetric zip moto jacket in black leather. Silver hardware.', price: 145, imageSearches: ['leather motorcycle jacket'] },
      { name: 'Wool Peacoat', description: 'Navy melton wool peacoat with anchor buttons. Naval heritage style.', price: 98, imageSearches: ['wool peacoat navy'] },
      { name: 'Parka with Fur Hood', description: 'Olive green parka with faux fur trim. Multiple pockets, drawcord waist.', price: 88, imageSearches: ['parka jacket fur hood'] },
      { name: 'Bomber Jacket', description: 'MA-1 style bomber in sage green. Ribbed cuffs and hem.', price: 72, imageSearches: ['bomber jacket green'] },
    ],
  },
  {
    name: 'Dresses & Skirts',
    slug: 'dresses-skirts',
    products: [
      { name: 'Floral Midi Dress', description: 'V-neck midi dress with ditsy floral print. Flutter sleeves, smocked waist.', price: 58, imageSearches: ['floral midi dress'] },
      { name: 'A-Line Denim Skirt', description: 'Button-front denim skirt hitting at the knee. Classic A-line shape.', price: 42, imageSearches: ['denim a line skirt'] },
      { name: 'Maxi Wrap Dress', description: 'Rust-colored wrap maxi in lightweight jersey. Tie waist, flutter hem.', price: 65, imageSearches: ['wrap maxi dress'] },
      { name: 'Pleated Midi Skirt', description: 'Champagne satin pleated skirt. Elastic waist, elegant movement.', price: 48, imageSearches: ['pleated midi skirt'] },
      { name: 'Shirt Dress', description: 'Striped cotton shirt dress with tie belt. Collared, button-through.', price: 52, imageSearches: ['shirt dress striped'] },
      { name: 'Mini Denim Skirt', description: 'Light wash denim mini with front slit. Raw hem detail.', price: 35, imageSearches: ['denim mini skirt'] },
    ],
  },
  {
    name: 'Activewear',
    slug: 'activewear',
    products: [
      { name: 'Yoga Leggings', description: 'High-waist black leggings with four-way stretch. Moisture-wicking fabric.', price: 38, imageSearches: ['yoga leggings black'] },
      { name: 'Sports Bra', description: 'Medium-support sports bra in teal. Racerback, removable pads.', price: 28, imageSearches: ['sports bra activewear'] },
      { name: 'Track Jacket', description: 'Retro nylon track jacket with contrast stripes. Full zip, side pockets.', price: 55, imageSearches: ['track jacket retro'] },
      { name: 'Gym Shorts', description: 'Lightweight mesh-lined running shorts. Drawstring waist, reflective trim.', price: 25, imageSearches: ['running gym shorts'] },
      { name: 'Zip Hoodie', description: 'Heather grey zip-up hoodie. Soft fleece interior, kangaroo pockets.', price: 48, imageSearches: ['zip hoodie grey'] },
      { name: 'Performance Tee', description: 'Quick-dry training tee with mesh panels. Athletic fit.', price: 22, imageSearches: ['performance training shirt'] },
    ],
  },
  {
    name: 'Home & Decor',
    slug: 'home-decor',
    products: [
      { name: 'Ceramic Vase', description: 'Hand-thrown terracotta vase with matte glaze. Perfect for dried flowers.', price: 35, imageSearches: ['ceramic vase terracotta'] },
      { name: 'Vintage Table Lamp', description: 'Brass base table lamp with linen shade. Warm ambient glow.', price: 68, imageSearches: ['vintage table lamp brass'] },
      { name: 'Woven Throw Blanket', description: 'Chunky knit throw in cream wool blend. Cozy texture for sofas.', price: 55, imageSearches: ['woven throw blanket'] },
      { name: 'Ornate Picture Frame', description: 'Gilded baroque-style frame for 8x10 prints. Ornate carved detail.', price: 28, imageSearches: ['ornate gold picture frame'] },
      { name: 'Brass Candle Holders', description: 'Set of two tapered brass candlesticks. Mid-century modern shape.', price: 32, imageSearches: ['brass candle holder'] },
      { name: 'Marble Bookends', description: 'White marble bookends with gold veining. Heavy, sculptural pair.', price: 45, imageSearches: ['marble bookends'] },
    ],
  },
  {
    name: 'Electronics',
    slug: 'electronics',
    products: [
      { name: 'Vintage Film Camera', description: '35mm rangefinder camera with fixed lens. Fully mechanical, light meter works.', price: 135, imageSearches: ['vintage film camera 35mm'] },
      { name: 'Bluetooth Speaker', description: 'Portable speaker with 12-hour battery. Water-resistant, rich bass.', price: 65, imageSearches: ['bluetooth portable speaker'] },
      { name: 'Mechanical Keyboard', description: 'Tenkeyless keyboard with Cherry MX switches. RGB backlight, PBT caps.', price: 95, imageSearches: ['mechanical keyboard'] },
      { name: 'Vinyl Record Player', description: 'Belt-drive turntable with built-in speakers. USB output for digitizing.', price: 180, imageSearches: ['vinyl record player turntable'] },
      { name: 'Retro AM/FM Radio', description: 'Wood cabinet radio with analog tuning dial. Warm tube-amp sound.', price: 88, imageSearches: ['vintage radio wood cabinet'] },
      { name: 'Over-Ear Headphones', description: 'Closed-back studio headphones with detachable cable. Flat frequency response.', price: 72, imageSearches: ['over ear headphones studio'] },
    ],
  },
]

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

type WikimediaPage = {
  title?: string
  imageinfo?: Array<{ url?: string; thumburl?: string }>
}

function isUsableImageUrl(url: string, title?: string): boolean {
  const haystack = `${url} ${title ?? ''}`.toLowerCase()
  if (/\.(pdf|djvu|svg|gif)(\?|$|\.)/i.test(haystack)) return false
  if (haystack.includes('/page1-') && haystack.includes('.pdf')) return false
  return /\.(jpg|jpeg|png|webp)(\?|$)/i.test(url)
}

async function fetchWithRetry(url: string, retries = 4): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
    if (res.status !== 429 || attempt === retries) return res
    const waitMs = 1500 * 2 ** attempt
    console.warn(`  Rate limited, retrying in ${waitMs}ms...`)
    await sleep(waitMs)
  }
  throw new Error('Unreachable')
}

async function fetchWikimediaImageUrls(searchTerms: string[], neededCount: number): Promise<string[]> {
  const urls: string[] = []
  const seen = new Set<string>()

  for (const term of searchTerms) {
    if (urls.length >= neededCount) break

    const params = new URLSearchParams({
      action: 'query',
      generator: 'search',
      gsrsearch: `filetype:bitmap ${term}`,
      gsrnamespace: '6',
      gsrlimit: '10',
      prop: 'imageinfo|info',
      inprop: 'url',
      iiprop: 'url',
      iiurlwidth: '800',
      format: 'json',
    })

    const res = await fetchWithRetry(`https://commons.wikimedia.org/w/api.php?${params}`)
    if (!res.ok) {
      console.warn(`Wikimedia search failed for "${term}": ${res.status}`)
      continue
    }

    const data = (await res.json()) as { query?: { pages?: Record<string, WikimediaPage> } }
    const pages = data.query?.pages ?? {}

    for (const page of Object.values(pages)) {
      const info = page.imageinfo?.[0]
      const url = info?.thumburl ?? info?.url
      if (!url || seen.has(url)) continue
      if (!isUsableImageUrl(url, page.title)) continue

      seen.add(url)
      urls.push(url)
      if (urls.length >= neededCount) break
    }

    await sleep(1200)
  }

  return urls
}

async function downloadImageBuffer(imageUrl: string): Promise<Buffer> {
  const res = await fetchWithRetry(imageUrl)
  if (!res.ok) {
    throw new Error(`Download failed (${res.status}) for ${imageUrl}`)
  }
  return Buffer.from(await res.arrayBuffer())
}

function picsumFallbackUrl(seed: string): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/800`
}

async function uploadToCloudinary(imageUrl: string, fallbackSeed?: string): Promise<{ url: string; publicId: string }> {
  let buffer: Buffer

  try {
    buffer = await downloadImageBuffer(imageUrl)
  } catch (err) {
    if (!fallbackSeed) throw err
    console.warn(`  Using Picsum fallback for seed "${fallbackSeed}"`)
    buffer = await downloadImageBuffer(picsumFallbackUrl(fallbackSeed))
  }

  const base64 = buffer.toString('base64')

  const result = await cloudinary.uploader.upload(`data:image/jpeg;base64,${base64}`, {
    folder: 'ecommerce/seed',
    resource_type: 'image',
  })

  return {
    url: result.secure_url,
    publicId: result.public_id,
  }
}

async function seedProductImages(
  productId: string,
  productName: string,
  productSlug: string,
  imageSearches: string[],
): Promise<number> {
  const neededCount = imageSearches.length
  const existingCount = await prisma.productImage.count({ where: { productId } })

  if (existingCount >= neededCount) {
    console.log(`  ↷ Skipping images for "${productName}" (${existingCount} already exist)`)
    return 0
  }

  const remainingSearches = imageSearches.slice(existingCount)
  const sourceUrls = await fetchWikimediaImageUrls(remainingSearches, neededCount - existingCount)

  if (sourceUrls.length < neededCount - existingCount) {
    const missing = neededCount - existingCount - sourceUrls.length
    for (let i = 0; i < missing; i++) {
      sourceUrls.push(picsumFallbackUrl(`${productSlug}-${existingCount + sourceUrls.length + i}`))
    }
  }

  let uploaded = 0
  const startIndex = existingCount

  for (const [index, sourceUrl] of sourceUrls.entries()) {
    const sortOrder = startIndex + index
    try {
      const { url, publicId } = await uploadToCloudinary(
        sourceUrl,
        `${productSlug}-${sortOrder}`,
      )
      await prisma.productImage.create({
        data: {
          productId,
          url,
          publicId,
          isPrimary: sortOrder === 0,
          sortOrder,
        },
      })
      uploaded++
      console.log(`  ✓ Image ${sortOrder + 1}/${sourceUrls.length} uploaded for "${productName}"`)
      await sleep(1500)
    } catch (err) {
      console.warn(`  ⚠ Upload failed for "${productName}" image ${sortOrder + 1}:`, err)
    }
  }

  return uploaded
}

async function main() {
  console.log('Seeding THRIFT. database...\n')

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
  console.log(`Admin user: ${admin.email}`)

  let categoryCount = 0
  let productCount = 0
  let imageCount = 0

  for (const categoryData of SEED_CATEGORIES) {
    const category = await prisma.category.upsert({
      where: { slug: categoryData.slug },
      update: { name: categoryData.name },
      create: {
        name: categoryData.name,
        slug: categoryData.slug,
      },
    })
    categoryCount++
    console.log(`\nCategory: ${category.name}`)

    for (const productData of categoryData.products) {
      const slug = slugify(productData.name)

      const product = await prisma.product.upsert({
        where: { slug },
        update: {
          name: productData.name,
          description: productData.description,
          price: productData.price,
          categoryId: category.id,
          isActive: true,
        },
        create: {
          name: productData.name,
          slug,
          description: productData.description,
          categoryId: category.id,
          price: productData.price,
          isActive: true,
        },
      })
      productCount++
      console.log(`Product: ${product.name}`)

      const uploaded = await seedProductImages(
        product.id,
        product.name,
        product.slug,
        productData.imageSearches,
      )
      imageCount += uploaded
    }
  }

  console.log('\n--- Seed complete ---')
  console.log(`Categories: ${categoryCount}`)
  console.log(`Products:   ${productCount}`)
  console.log(`Images:     ${imageCount} uploaded this run`)
  console.log('\nImages sourced from Wikimedia Commons (free, no API key).')
  console.log('Picsum.photos is used as fallback when Wikimedia is unavailable.')
  console.log('Uploaded via existing Cloudinary credentials (ecommerce/seed folder).')
  console.log(`\n"${SEED_CATEGORIES[4].products[0].name}" has ${SEED_CATEGORIES[4].products[0].imageSearches.length} distinct images.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    await pool.end()
    process.exit(1)
  })

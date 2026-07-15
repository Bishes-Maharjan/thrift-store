import { Prisma, type Role } from '@prisma/client'

export type {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  Role,
} from '@prisma/client'

// ─── Base model types ────────────────────────────────────────────────────────

export type Product = Prisma.ProductGetPayload<Record<string, never>>
export type ProductImage = Prisma.ProductImageGetPayload<Record<string, never>>
export type Order = Prisma.OrderGetPayload<Record<string, never>>
export type OrderItem = Prisma.OrderItemGetPayload<Record<string, never>>
export type Cart = Prisma.CartGetPayload<Record<string, never>>
export type CartItem = Prisma.CartItemGetPayload<Record<string, never>>
export type User = Prisma.UserGetPayload<Record<string, never>>

// ─── Shared include shapes ───────────────────────────────────────────────────

const productWithImagesInclude = {
  images: true,
} satisfies Prisma.ProductInclude

const productWithDetailsInclude = {
  images: true,
  category: true,
} satisfies Prisma.ProductInclude

const productWithImagesOrderedInclude = {
  images: {
    orderBy: { sortOrder: 'asc' as const },
  },
} satisfies Prisma.ProductInclude

const cartItemWithProductInclude = {
  product: {
    include: productWithImagesInclude,
  },
} satisfies Prisma.CartItemInclude

const cartWithDetailsInclude = {
  items: {
    include: cartItemWithProductInclude,
  },
} satisfies Prisma.CartInclude

const orderWithDetailsInclude = {
  items: true,
  address: true,
  payment: true,
} satisfies Prisma.OrderInclude

const orderItemWithProductInclude = {
  product: true,
} satisfies Prisma.OrderItemInclude

const orderWithAdminDetailsInclude = {
  user: true,
  address: true,
  payment: true,
  items: {
    include: orderItemWithProductInclude,
  },
} satisfies Prisma.OrderInclude

const orderAdminListInclude = {
  user: true,
  payment: true,
  _count: { select: { items: true } },
} satisfies Prisma.OrderInclude

const userAdminListInclude = {
  _count: {
    select: { orders: true },
  },
} satisfies Prisma.UserInclude

// ─── Product ─────────────────────────────────────────────────────────────────

export type ProductWithImages = Prisma.ProductGetPayload<{
  include: typeof productWithImagesInclude
}>

export type ProductWithDetails = Prisma.ProductGetPayload<{
  include: typeof productWithDetailsInclude
}>

export type ProductWithImagesOrdered = Prisma.ProductGetPayload<{
  include: typeof productWithImagesOrderedInclude
}>

// ─── Cart ────────────────────────────────────────────────────────────────────

export type CartItemWithDetails = Prisma.CartItemGetPayload<{
  include: typeof cartItemWithProductInclude
}>

export type CartWithDetails = Prisma.CartGetPayload<{
  include: typeof cartWithDetailsInclude
}>

// ─── Order ───────────────────────────────────────────────────────────────────

export type OrderWithDetails = Prisma.OrderGetPayload<{
  include: typeof orderWithDetailsInclude
}>

export type OrderItemWithProduct = Prisma.OrderItemGetPayload<{
  include: typeof orderItemWithProductInclude
}>

export type OrderWithAdminDetails = Prisma.OrderGetPayload<{
  include: typeof orderWithAdminDetailsInclude
}>

export type OrderAdminListItem = Prisma.OrderGetPayload<{
  include: typeof orderAdminListInclude
}>

// ─── User ────────────────────────────────────────────────────────────────────

export type UserAdminListItem = Prisma.UserGetPayload<{
  include: typeof userAdminListInclude
}>

export type UserFormInitialData = Pick<User, 'id' | 'email' | 'role'> & {
  name: string
  phone: string
}

export type UserFormState = {
  id?: string
  email: string
  name: string
  phone: string
  role: Role
  password?: string
}

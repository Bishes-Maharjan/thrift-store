-- 1. Drop foreign keys and tables that reference ProductVariant
-- Drop CartItem rows (they reference ProductVariant)
DELETE FROM "CartItem";

-- Drop OrderItem foreign key to ProductVariant
ALTER TABLE "OrderItem" DROP CONSTRAINT IF EXISTS "OrderItem_productVariantId_fkey";

-- Drop CartItem foreign key to ProductVariant
ALTER TABLE "CartItem" DROP CONSTRAINT IF EXISTS "CartItem_productVariantId_fkey";

-- 2. Restructure CartItem: remove productVariantId, add productId
ALTER TABLE "CartItem" DROP COLUMN "productVariantId";
ALTER TABLE "CartItem" ADD COLUMN "productId" TEXT NOT NULL DEFAULT '';

-- Add foreign key from CartItem to Product
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Remove the default after column is added
ALTER TABLE "CartItem" ALTER COLUMN "productId" DROP DEFAULT;

-- 3. Restructure OrderItem: remove productVariantId, add productId
ALTER TABLE "OrderItem" DROP COLUMN "productVariantId";
ALTER TABLE "OrderItem" ADD COLUMN "productId" TEXT NOT NULL DEFAULT '';

-- Add foreign key from OrderItem to Product
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Remove the default after column is added
ALTER TABLE "OrderItem" ALTER COLUMN "productId" DROP DEFAULT;

-- 4. Drop the ProductVariant table
DROP TABLE IF EXISTS "ProductVariant";

-- 5. Rename basePrice to price on Product
ALTER TABLE "Product" RENAME COLUMN "basePrice" TO "price";

-- 6. Remove category hierarchy (parentId, self-relation)
ALTER TABLE "Category" DROP CONSTRAINT IF EXISTS "Category_parentId_fkey";
ALTER TABLE "Category" DROP COLUMN IF EXISTS "parentId";

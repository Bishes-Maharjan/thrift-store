'use server'

import { cloudinary } from '@/lib/cloudinary'
import { auth } from '@/lib/auth'

export async function getCloudinarySignature() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  const timestamp = Math.round(new Date().getTime() / 1000)

  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder: 'ecommerce',
    },
    process.env.CLOUDINARY_API_SECRET!
  )

  return { 
    timestamp, 
    signature,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!
  }
}

export async function deleteCloudinaryImage(publicId: string) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  const result = await cloudinary.uploader.destroy(publicId)
  return result
}

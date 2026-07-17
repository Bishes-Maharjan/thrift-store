'use client'

import { useState } from 'react'

export default function ProductGallery({
  images,
  productName,
}: {
  images: { id: string; url: string }[]
  productName: string
}) {
  const [selectedImage, setSelectedImage] = useState(images[0]?.url || '')

  return (
    <div className="flex flex-col-reverse">
      <div className="mt-6 w-full max-w-2xl mx-auto sm:block lg:max-w-none">
        <div className="grid grid-cols-4 gap-4" aria-orientation="horizontal" role="tablist">
          {images.map((image) => (
            <div
              key={image.id}
              onClick={() => setSelectedImage(image.url)}
              className={`relative h-24 bg-[#f5f5f7] flex items-center justify-center cursor-pointer border transition-all rounded-lg overflow-hidden ${
                selectedImage === image.url
                  ? 'border-[#0071e3] ring-2 ring-[#0071e3] ring-offset-2'
                  : 'border-[#d2d2d7] hover:border-[#0071e3]'
              }`}
            >
              <img src={image.url} alt="" className="absolute inset-0 w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      <div className="w-full aspect-[3/4] bg-[#f5f5f7] flex items-center justify-center rounded-xl overflow-hidden relative">
        {selectedImage ? (
          <img src={selectedImage} alt={productName} className="w-full h-full object-center object-cover transition-opacity duration-300" />
        ) : (
          <span className="text-[#86868b] text-xs tracking-widest uppercase">No Image</span>
        )}
      </div>
    </div>
  )
}

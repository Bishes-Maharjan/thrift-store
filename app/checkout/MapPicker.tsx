'use client'

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix Leaflet's default icon path issues with webpack
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
})

function LocationMarker({
  position,
  setPosition,
  onLocationFound
}: {
  position: L.LatLng | null
  setPosition: (pos: L.LatLng) => void
  onLocationFound: (lat: number, lng: number) => void
}) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng)
      onLocationFound(e.latlng.lat, e.latlng.lng)
    },
    locationfound(e) {
      setPosition(e.latlng)
      map.flyTo(e.latlng, 15)
      onLocationFound(e.latlng.lat, e.latlng.lng)
    }
  })

  useEffect(() => {
    map.locate()
  }, [map])

  return position === null ? null : <Marker position={position} icon={icon} />
}

export default function MapPicker({
  onLocationSelect
}: {
  onLocationSelect: (lat: number, lng: number, address: { city: string; province: string; postalCode: string; line1: string } | null) => void
}) {
  const [position, setPosition] = useState<L.LatLng | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleLocationFound = async (lat: number, lng: number) => {
    setIsLoading(true)
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
      const data = await res.json()
      
      const address = {
        city: data.address?.city || data.address?.town || data.address?.village || '',
        province: data.address?.state || data.address?.region || '',
        postalCode: data.address?.postcode || '',
        line1: data.display_name || '',
      }

      onLocationSelect(lat, lng, address)
    } catch (error) {
      console.error('Error reverse geocoding:', error)
      onLocationSelect(lat, lng, null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative h-64 w-full rounded-xl overflow-hidden border border-[#d2d2d7] shadow-sm">
      <MapContainer
        center={[27.7172, 85.3240]} // Default to Kathmandu
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} onLocationFound={handleLocationFound} />
      </MapContainer>
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-[400] backdrop-blur-sm">
          <span className="text-xs font-bold tracking-widest uppercase text-[#1d1d1f] bg-white px-4 py-2 rounded-full shadow-sm border border-[#d2d2d7]">Fetching address...</span>
        </div>
      )}
    </div>
  )
}

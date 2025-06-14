/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react'

declare global {
  interface Window { L: any }
}

interface LocationPickerProps {
  onLocationSelect: (location: { name: string; latitude: number; longitude: number }) => void
  initialLocation?: { latitude: number; longitude: number }
  className?: string
}

export default function SimpleMapPicker({
  onLocationSelect,
  initialLocation,
  className = ''
}: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const markerRef = useRef<any>(null)

  useEffect(() => {
    if (!mapRef.current || !window.L) return

    const lat0 = initialLocation?.latitude ?? 41.1579
    const lng0 = initialLocation?.longitude ?? -8.6291
    const map = window.L.map(mapRef.current, { attributionControl: false }).setView([lat0, lng0], 10)

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map)

    map.on('click', (e: any) => onMapClick(e.latlng.lat, e.latlng.lng))
    mapInstance.current = map

    if (initialLocation) {
      markerRef.current = window.L.marker([lat0, lng0]).addTo(map)
      markerRef.current.bindPopup('Initial location').openPopup()
    }

    return () => map.remove()
  })

  const onMapClick = async (lat: number, lng: number) => {
    const map = mapInstance.current
    if (!map) return

    map.setView([lat, lng], 15)
    if (markerRef.current) {
      map.removeLayer(markerRef.current)
    }
    markerRef.current = window.L.marker([lat, lng]).addTo(map)

    let name: string
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=14`, 
        { headers: { 'User-Agent': 'FarmVille-App/1.0' } }
      )
      const data = await res.json()
      name = data.display_name ?? ` ${lat.toFixed(4)}, ${lng.toFixed(4)}`
    } catch {
      name = ` ${lat.toFixed(4)}, ${lng.toFixed(4)}`
    }

    markerRef.current.bindPopup(name).openPopup()
    onLocationSelect({ name, latitude: lat, longitude: lng })
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="relative">
        <div
          ref={mapRef}
          className="w-full h-80 border border-gray-300 rounded-lg cursor-crosshair"
          style={{ minHeight: '320px' }}
        />
        <div className="absolute top-3 left-3 bg-white bg-opacity-90 px-3 py-2 text-xs rounded shadow">
           Click to pin location
        </div>
      </div>
    </div>
  )
}

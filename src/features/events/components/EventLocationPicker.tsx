import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'
import { InputNumber, Spin } from 'antd'
import { useCallback } from 'react'
import { GOOGLE_MAPS_API_KEY } from '@/constants'
import { getGoogleMapsLoaderOptions } from '@/constants/googleMaps'
import { DEFAULT_EVENT_CENTER } from '@/features/events/eventHelpers'

const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '280px',
  borderRadius: '8px',
}

interface EventLocationPickerProps {
  lat?: number | null
  lng?: number | null
  onChange: (coords: { lat: number; lng: number }) => void
}

export function EventLocationPicker({ lat, lng, onChange }: EventLocationPickerProps) {
  const { isLoaded, loadError } = useJsApiLoader(getGoogleMapsLoaderOptions())

  const position = {
    lat: typeof lat === 'number' ? lat : DEFAULT_EVENT_CENTER.lat,
    lng: typeof lng === 'number' ? lng : DEFAULT_EVENT_CENTER.lng,
  }

  const handleMapClick = useCallback(
    (event: google.maps.MapMouseEvent) => {
      const nextLat = event.latLng?.lat()
      const nextLng = event.latLng?.lng()
      if (typeof nextLat !== 'number' || typeof nextLng !== 'number') return
      onChange({ lat: Number(nextLat.toFixed(6)), lng: Number(nextLng.toFixed(6)) })
    },
    [onChange],
  )

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="rounded-md border border-dashed border-alygo-border p-4 text-sm text-alygo-text-muted">
        Google Maps API key missing. Set `VITE_GOOGLE_MAPS_API_KEY` or `VITE_API_GOOGLE_MAPS_URL` in
        `.env.local`.
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="rounded-md border border-dashed border-red-300 p-4 text-sm text-red-600">
        Failed to load Google Maps. Check the API key and Maps JavaScript API access.
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-md border border-alygo-border">
        <Spin />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={position}
        zoom={12}
        onClick={handleMapClick}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        <Marker
          position={position}
          draggable
          onDragEnd={(event) => {
            const nextLat = event.latLng?.lat()
            const nextLng = event.latLng?.lng()
            if (typeof nextLat !== 'number' || typeof nextLng !== 'number') return
            onChange({
              lat: Number(nextLat.toFixed(6)),
              lng: Number(nextLng.toFixed(6)),
            })
          }}
        />
      </GoogleMap>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-alygo-text-muted">Latitude</label>
          <InputNumber
            className="!w-full"
            value={position.lat}
            step={0.0001}
            onChange={(value) => {
              if (typeof value !== 'number') return
              onChange({ lat: value, lng: position.lng })
            }}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-alygo-text-muted">Longitude</label>
          <InputNumber
            className="!w-full"
            value={position.lng}
            step={0.0001}
            onChange={(value) => {
              if (typeof value !== 'number') return
              onChange({ lat: position.lat, lng: value })
            }}
          />
        </div>
      </div>
      <p className="text-xs text-alygo-text-muted">
        Click the map or drag the marker to set the event location.
      </p>
    </div>
  )
}

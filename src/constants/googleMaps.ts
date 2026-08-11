import { GOOGLE_MAPS_API_KEY } from '@/constants'

/** Stable libraries array — required by @react-google-maps/api useJsApiLoader */
export const GOOGLE_MAPS_LIBRARIES: ('geometry')[] = ['geometry']

export const GOOGLE_MAPS_LOADER_ID = 'alygo-google-maps'

export function getGoogleMapsLoaderOptions() {
  return {
    id: GOOGLE_MAPS_LOADER_ID,
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  }
}

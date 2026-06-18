import type { CityResult } from '@/types'

const BASE = 'https://nominatim.openstreetmap.org'
const HEADERS = { 'Accept-Language': 'en' }

interface NominatimResult {
  lat: string
  lon: string
  name: string
  class: string
  type: string
  address: {
    city?: string
    town?: string
    village?: string
    municipality?: string
    state?: string
    county?: string
    country?: string
  }
}

function parseResult(r: NominatimResult): CityResult {
  return {
    name: r.address.city || r.address.town || r.address.village || r.address.municipality || r.name,
    country: r.address.country ?? '',
    state: r.address.state || r.address.county || '',
    lat: parseFloat(r.lat),
    lng: parseFloat(r.lon),
  }
}

const PLACE_TYPES = new Set(['city', 'town', 'village', 'administrative'])

export async function searchCities(query: string): Promise<CityResult[]> {
  if (query.length < 2) return []
  const url = `${BASE}/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=7&accept-language=en`
  const res = await fetch(url, { headers: HEADERS })
  const data: NominatimResult[] = await res.json()

  let places = data.filter(r => r.class === 'place' || PLACE_TYPES.has(r.type))
  if (!places.length) places = data.slice(0, 5)

  return places.slice(0, 6).map(parseResult)
}

export async function reverseGeocode(lat: number, lng: number): Promise<CityResult> {
  const url = `${BASE}/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
  const res = await fetch(url, { headers: HEADERS })
  const data = await res.json()
  const city = data.address.city || data.address.town || data.address.village || data.address.county || 'Unknown'
  return {
    name: city,
    country: data.address.country ?? '',
    state: data.address.state ?? '',
    lat,
    lng,
  }
}

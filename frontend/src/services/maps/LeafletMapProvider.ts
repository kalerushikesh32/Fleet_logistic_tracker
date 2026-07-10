import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { IMapProvider, MarkerOptions } from './IMapProvider'

// Fix default marker icons broken by Webpack/Vite asset hashing
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

export class LeafletMapProvider implements IMapProvider {
  private map: L.Map | null = null
  private markers = new Map<string, L.Marker>()

  initialize(containerId: string, center: [number, number], zoom: number): void {
    const el = document.getElementById(containerId)
    if (!el) throw new Error(`Map container #${containerId} not found`)

    this.map = L.map(containerId).setView(center, zoom)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(this.map)
  }

  setMarker(id: string, position: [number, number], options: MarkerOptions): void {
    if (!this.map) return

    const existing = this.markers.get(id)
    if (existing) {
      existing.setLatLng(position)
      if (options.popup) existing.setPopupContent(options.popup)
      return
    }

    const marker = L.marker(position).addTo(this.map)
    if (options.popup) marker.bindPopup(options.popup)
    else if (options.label) marker.bindTooltip(options.label)
    this.markers.set(id, marker)
  }

  removeMarker(id: string): void {
    const marker = this.markers.get(id)
    if (marker) {
      marker.remove()
      this.markers.delete(id)
    }
  }

  setCenter(position: [number, number], zoom?: number): void {
    if (!this.map) return
    this.map.setView(position, zoom ?? this.map.getZoom())
  }

  destroy(): void {
    if (this.map) {
      this.map.remove()
      this.map = null
      this.markers.clear()
    }
  }
}

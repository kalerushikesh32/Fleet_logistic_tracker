/**
 * Abstract map provider interface.
 * All map-specific code goes through this seam so providers are swappable
 * (e.g. Leaflet today, Google Maps later) without touching component code.
 */
export interface MarkerOptions {
  label: string
  color?: string
  popup?: string
}

export interface IMapProvider {
  initialize(containerId: string, center: [number, number], zoom: number): void
  setMarker(id: string, position: [number, number], options: MarkerOptions): void
  removeMarker(id: string): void
  setCenter(position: [number, number], zoom?: number): void
  destroy(): void
}

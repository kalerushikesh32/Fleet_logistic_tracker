import { useEffect, useRef } from 'react'
import type { IMapProvider } from '../../services/maps/IMapProvider'
import { LeafletMapProvider } from '../../services/maps/LeafletMapProvider'
import type { MapVehicle } from '../../types'

interface FleetMapProps {
  vehicles: MapVehicle[]
  /** Inject a provider for testing — defaults to Leaflet in production. */
  provider?: IMapProvider
  height?: number | string
}

// Default center — India; map will show vehicle markers when data loads
const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629]
const DEFAULT_ZOOM = 5

let _mapCounter = 0

export function FleetMap({ vehicles, provider: injectedProvider, height = 400 }: FleetMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const providerRef = useRef<IMapProvider | null>(null)
  const containerIdRef = useRef(`fleet-map-${++_mapCounter}`)

  useEffect(() => {
    if (!containerRef.current) return

    containerRef.current.id = containerIdRef.current
    const p = injectedProvider ?? new LeafletMapProvider()
    p.initialize(containerIdRef.current, DEFAULT_CENTER, DEFAULT_ZOOM)
    providerRef.current = p

    return () => {
      p.destroy()
      providerRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync markers whenever vehicle data changes
  useEffect(() => {
    const p = providerRef.current
    if (!p) return
    vehicles.forEach(v => {
      if (!v.location) return
      p.setMarker(v.vehicle_id, [v.location.latitude, v.location.longitude], {
        label: v.license_plate,
        popup: `<b>${v.license_plate}</b><br/>${v.type} — ${v.status}`,
      })
    })
  }, [vehicles])

  return <div ref={containerRef} style={{ height, width: '100%' }} />
}

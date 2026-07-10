// Central type definitions matching the backend API contracts.

export type VehicleType = 'TRUCK' | 'SMALL_VEHICLE'
export type VehicleStatus = 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'INACTIVE'
export type CargoStatus = 'PENDING' | 'LOADED' | 'IN_TRANSIT' | 'UNLOADED' | 'DELIVERED'
export type DriverStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE'
export type OperationType = 'LOADING' | 'UNLOADING'

export interface User { id: string; email: string; name: string }

export interface Vehicle {
  id: string; license_plate: string; type: VehicleType
  make: string; model: string; year: number
  status: VehicleStatus; created_at: string; updated_at: string | null
}

export interface Location {
  id: string; vehicle_id: string
  latitude: number; longitude: number; timestamp: string
}

export interface Cargo {
  id: string; description: string; weight: number
  length: number | null; width: number | null; height: number | null
  origin: string; destination: string; status: CargoStatus
  vehicle_id: string | null; created_at: string; updated_at: string | null
}

export interface Operation {
  id: string; cargo_id: string; vehicle_id: string
  type: OperationType; latitude: number | null; longitude: number | null
  notes: string | null; timestamp: string
}

export interface Driver {
  id: string; name: string; phone: string; email: string | null
  license_no: string; status: DriverStatus; vehicle_id: string | null
  created_at: string; updated_at: string | null
}

export interface ApiError {
  status: number; code: string; message: string
  details?: Record<string, string[]>
}

export interface TokenResponse {
  access_token: string; token_type: string; user: User
}

export interface VehicleStats {
  total: number; available: number; in_use: number; maintenance: number; inactive: number
}
export interface CargoStats {
  pending: number; loaded: number; in_transit: number; unloaded: number; delivered: number
}
export interface MapVehicle {
  vehicle_id: string; license_plate: string; type: VehicleType
  status: VehicleStatus; location: Location | null
}

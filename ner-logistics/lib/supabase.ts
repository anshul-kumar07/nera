import { createClient } from '@supabase/supabase-js'

const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const rawSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const isValidUrl = (url: string) => {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

const supabaseUrl = isValidUrl(rawSupabaseUrl) ? rawSupabaseUrl : 'https://placeholder.supabase.co'
const supabaseAnonKey = rawSupabaseAnonKey && rawSupabaseAnonKey !== 'your_supabase_anon_key' ? rawSupabaseAnonKey : 'placeholder-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const isSupabaseConfigured = isValidUrl(rawSupabaseUrl) && Boolean(rawSupabaseAnonKey && rawSupabaseAnonKey !== 'your_supabase_anon_key')

// Database types
export type RouteStatus = 'open' | 'blocked' | 'at_risk' | 'damaged'
export type CargoType = 'medicine' | 'food' | 'fuel' | 'construction' | 'agricultural'
export type IncidentType = 'landslide' | 'flood' | 'road_damage' | 'bridge_failure' | 'congestion'
export type Severity = 'low' | 'medium' | 'high' | 'critical'
export type IncidentStatus = 'predicted' | 'reported' | 'confirmed' | 'resolved'

export interface Route {
  id: string
  name: string
  district: string
  state: string
  status: RouteStatus
  coordinates: [number, number][]
  highway_number?: string
  last_updated: string
}

export interface Incident {
  id: string
  reported_by?: string
  route_id?: string | null
  route_name?: string
  infrastructure_id?: string | null
  type?: IncidentType | string
  incident_type?: string
  description?: string
  photo_url?: string
  lat: number
  lng: number
  severity: Severity | string
  status?: IncidentStatus
  created_at?: string
  reported_at?: string
  confirmed_at?: string | null
  confirmed_by?: string | null
  resolved_at?: string | null
  resolved_by?: string | null
}

export interface Vehicle {
  id: string
  vehicle_number: string
  driver_name: string
  cargo_type: CargoType
  origin: string
  destination: string
  current_lat: number
  current_lng: number
  status: 'moving' | 'stopped' | 'delayed' | 'delivered'
  last_ping: string
}

export interface Alert {
  id: string
  title: string
  message: string
  severity: Severity
  district: string
  is_active: boolean
  created_at: string
}

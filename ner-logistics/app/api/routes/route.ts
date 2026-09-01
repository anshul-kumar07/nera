import { supabase } from '@/lib/supabase'
import { INITIAL_NER_ROUTES } from '@/lib/data'
import { NextRequest } from 'next/server'

// In-memory runtime cache for all 18 NER highways
let inMemoryRoutes = INITIAL_NER_ROUTES.map(r => ({ ...r }))

export async function GET() {
  try {
    const { data, error } = await supabase.from('routes').select('*')
    if (!error && data && data.length > 0) {
      // Merge DB status updates into our full 18-highway dataset
      const merged = INITIAL_NER_ROUTES.map(initial => {
        const dbMatch = data.find(
          d =>
            d.name?.toLowerCase() === initial.name.toLowerCase() ||
            d.highway_number?.toLowerCase() === initial.highway_number?.toLowerCase() ||
            d.id === initial.id
        )
        if (dbMatch) {
          return {
            ...initial,
            status: dbMatch.status || initial.status,
            last_updated: dbMatch.last_updated,
          }
        }
        // Check inMemory status
        const memMatch = inMemoryRoutes.find(m => m.id === initial.id || m.name === initial.name)
        return memMatch || initial
      })
      return Response.json(merged)
    }
  } catch (err) {
    console.warn('Supabase routes fallback to in-memory store', err)
  }

  return Response.json(inMemoryRoutes)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { routeName, status } = body

    if (!routeName || !status) {
      return Response.json({ error: 'routeName and status required' }, { status: 400 })
    }

    // 1. Update in-memory state across all matching highways
    inMemoryRoutes = inMemoryRoutes.map(r => {
      if (
        r.name.toLowerCase().includes(routeName.toLowerCase()) ||
        routeName.toLowerCase().includes(r.name.toLowerCase()) ||
        r.highway_number?.toLowerCase() === routeName.toLowerCase()
      ) {
        return { ...r, status, last_updated: new Date().toISOString() }
      }
      return r
    })

    // 2. Update Supabase if available
    try {
      await supabase
        .from('routes')
        .update({ status, last_updated: new Date().toISOString() })
        .ilike('name', `%${routeName.split(' ')[0]}%`)
    } catch (dbErr) {
      console.warn('Supabase route update error:', dbErr)
    }

    return Response.json({ success: true, updatedRoutes: inMemoryRoutes })
  } catch (err: unknown) {
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const numero = url.searchParams.get('numero')
    if (!numero) return NextResponse.json({ error: 'Missing numero' }, { status: 400 })

    const prefix = `${numero}/`
    const { data, error } = await supabase.storage.from('documents').list(prefix, { limit: 100 })
    if (error) {
      console.error('list docs', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create signed URLs for each object (1 hour)
    const expiresIn = 60 * 60
    type StorageObject = { name: string; size?: number; updated_at?: string }
    const items = await Promise.all(
      (data || []).map(async (item: any) => {
        const path = `${numero}/${item.name}`
        const { data: signed, error: signedErr } = await supabase.storage.from('documents').createSignedUrl(path, expiresIn)
        if (signedErr) console.error('createSignedUrl error', signedErr)

        // Ensure we return a numeric size when possible. Some storage backends
        // may not include `size` on the list response, so fallback to metadata.
        let size = item.size
        if (typeof size !== 'number') {
          try {
            const { data: meta, error: metaErr } = await supabase.storage.from('documents').getMetadata(path)
            if (metaErr) {
              console.error('getMetadata error', metaErr)
            } else if (meta && typeof (meta as any).size === 'number') {
              size = (meta as any).size
            }
          } catch (e) {
            console.error('getMetadata failed', e)
          }
        }

        return {
          name: item.name,
          size,
          updated_at: item.updated_at,
          url: signed?.signedUrl || null,
        }
      })
    )

    return NextResponse.json({ ok: true, items })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

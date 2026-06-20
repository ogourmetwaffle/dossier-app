import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2022-11-15' })

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature') || ''

  const buf = await req.arrayBuffer()
  const rawBody = Buffer.from(buf)

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''
  if (!webhookSecret) {
    console.error('No STRIPE_WEBHOOK_SECRET configured')
    return new Response('Webhook secret not configured', { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed.', err.message)
    return new Response('Invalid signature', { status: 400 })
  }

  // Initialize Supabase admin client (requires service role key)
  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const metadata = session.metadata || {}
    const dossierId = metadata.dossierId || null

    if (dossierId && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        await supabaseAdmin.from('dossiers').update({ paiement_effectue: true, stripe_payment_id: session.id }).eq('id', dossierId)
        console.log('Dossier updated for', dossierId)
      } catch (err) {
        console.error('Error updating dossier', err)
      }
    } else {
      console.warn('No dossierId or SUPABASE_SERVICE_ROLE_KEY not set; cannot mark payment')
    }
  }

  return new Response('ok')
}

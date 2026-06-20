import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2022-11-15' })

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { numero, dossierId } = body

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Conversion de permis - Permis Express'
            },
            unit_amount: 4900
          },
          quantity: 1
        }
      ],
      metadata: {
        numero: numero || '',
        dossierId: dossierId || ''
      },
      success_url: `${origin}/merci?session_id={CHECKOUT_SESSION_ID}&numero=${encodeURIComponent(numero || '')}`,
      cancel_url: `${origin}/deposer-dossier?cancelled=1`
    })

    return new Response(JSON.stringify({ url: session.url }), { status: 200 })
  } catch (err: any) {
    console.error(err)
    return new Response(JSON.stringify({ error: err.message || 'Internal error' }), { status: 500 })
  }
}

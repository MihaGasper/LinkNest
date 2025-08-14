import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '../../../utils/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature') as string
  const buf = Buffer.from(await req.arrayBuffer())

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(buf, sig, endpointSecret)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const email = session.customer_details?.email
      if (email) {
        // Lookup profile by email and set plan to 'pro'
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('email', email)
          .maybeSingle()
        if (profile?.id) {
          await supabaseAdmin.from('profiles').update({ plan: 'pro' }).eq('id', profile.id)
        }
      }
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Processing error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}



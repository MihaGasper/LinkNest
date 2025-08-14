import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

export async function POST(req: NextRequest) {
  try {
    const { currency = 'usd', interval = 'month', mode = 'subscription', success_url, cancel_url } = await req.json()
    if (!process.env.STRIPE_PRICE_USD_MONTH || !process.env.STRIPE_PRICE_EUR_MONTH) {
      return NextResponse.json({ error: 'Stripe price IDs not configured' }, { status: 400 })
    }

    const subscriptionPrices: Record<string, Record<string, string>> = {
      usd: {
        month: process.env.STRIPE_PRICE_USD_MONTH!,
        year: process.env.STRIPE_PRICE_USD_YEAR || process.env.STRIPE_PRICE_USD_MONTH!,
      },
      eur: {
        month: process.env.STRIPE_PRICE_EUR_MONTH!,
        year: process.env.STRIPE_PRICE_EUR_YEAR || process.env.STRIPE_PRICE_EUR_MONTH!,
      },
    }

    const oneTimePrices: Record<string, string> = {
      usd: process.env.STRIPE_PRICE_USD_LIFETIME || '',
      eur: process.env.STRIPE_PRICE_EUR_LIFETIME || '',
    }

    let session
    if (mode === 'payment') {
      const price = oneTimePrices[currency]
      if (!price) return NextResponse.json({ error: 'Invalid currency or missing lifetime price' }, { status: 400 })
      session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [{ price, quantity: 1 }],
        success_url: success_url || `${req.nextUrl.origin}/dashboard?checkout=success`,
        cancel_url: cancel_url || `${req.nextUrl.origin}/?checkout=cancel`,
        allow_promotion_codes: true,
      })
    } else {
      const price = subscriptionPrices[currency]?.['month']
      if (!price) return NextResponse.json({ error: 'Invalid currency or interval' }, { status: 400 })
      session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [{ price, quantity: 1 }],
        success_url: success_url || `${req.nextUrl.origin}/dashboard?checkout=success`,
        cancel_url: cancel_url || `${req.nextUrl.origin}/?checkout=cancel`,
        allow_promotion_codes: true,
      })
    }

    return NextResponse.json({ url: session.url })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Stripe error' }, { status: 500 })
  }
}



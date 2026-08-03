import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { saveDonation, DonationRecord } from '@techinejigbo/firebase/src/firestore';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-paystack-signature');
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    // Verify Paystack HMAC-SHA512 Signature if secret key is configured
    if (secretKey && !secretKey.includes('your_paystack_secret_key') && !secretKey.includes('placeholder')) {
      const hash = crypto
        .createHmac('sha512', secretKey)
        .update(rawBody)
        .digest('hex');

      if (hash !== signature) {
        console.warn('Paystack webhook received invalid signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    const { event, data } = payload;

    // Handle successful charge event
    if (event === 'charge.success' && data && data.status === 'success') {
      const reference = data.reference;
      const metadata = data.metadata || {};
      const customer = data.customer || {};

      const amountInNgn = (Number(data.amount) || 0) / 100;
      const donorEmail = customer.email || metadata.donorEmail || '';
      const donorName = metadata.isAnonymous 
        ? 'Anonymous Donor' 
        : (metadata.donorName || `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Generous Supporter');

      const donationData: Partial<DonationRecord> = {
        id: reference,
        reference,
        amount: amountInNgn,
        currency: data.currency || 'NGN',
        donorName,
        donorEmail,
        donorPhone: metadata.donorPhone || customer.phone || '',
        isAnonymous: Boolean(metadata.isAnonymous),
        purpose: metadata.purpose || 'General Impact Fund',
        message: metadata.message || '',
        status: 'success',
        channel: data.channel || 'card',
        paidAt: data.paid_at || new Date().toISOString(),
        createdAt: data.created_at || new Date().toISOString(),
        paystackResponse: data
      };

      await saveDonation(donationData);
      console.log(`[Paystack Webhook] Donation recorded successfully: ${reference}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('[Paystack Webhook] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

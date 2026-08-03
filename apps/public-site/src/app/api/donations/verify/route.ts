import { NextRequest, NextResponse } from 'next/server';
import { saveDonation, DonationRecord } from '@techinejigbo/firebase/src/firestore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      reference,
      donorName,
      donorEmail,
      donorPhone,
      isAnonymous,
      purpose,
      message,
      amount,
      currency = 'NGN'
    } = body;

    if (!reference || !donorEmail) {
      return NextResponse.json(
        { success: false, error: 'Reference and donor email are required.' },
        { status: 400 }
      );
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    let paymentVerified = false;
    let verifiedAmount = Number(amount) || 0;
    let verifiedCurrency = currency;
    let paymentChannel = 'card';
    let paidAt = new Date().toISOString();
    let paystackData: any = null;

    if (secretKey && !secretKey.includes('your_paystack_secret_key') && !secretKey.includes('placeholder')) {
      try {
        const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${secretKey}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        paystackData = data;

        if (data.status && data.data?.status === 'success') {
          paymentVerified = true;
          verifiedAmount = data.data.amount / 100; // Convert kobo to NGN
          verifiedCurrency = data.data.currency || currency;
          paymentChannel = data.data.channel || 'card';
          paidAt = data.data.paid_at || new Date().toISOString();
        } else {
          return NextResponse.json(
            { success: false, error: data.message || 'Payment verification failed.' },
            { status: 400 }
          );
        }
      } catch (err: any) {
        console.error('Paystack verification request error:', err);
        return NextResponse.json(
          { success: false, error: 'Failed to communicate with Paystack API.' },
          { status: 500 }
        );
      }
    } else {
      // In development/test mode without live secret key, allow recording confirmed client payload
      paymentVerified = true;
    }

    if (paymentVerified) {
      const donationData: Partial<DonationRecord> = {
        id: reference,
        reference,
        amount: verifiedAmount,
        currency: verifiedCurrency,
        donorName: isAnonymous ? 'Anonymous Donor' : (donorName || 'Generous Supporter'),
        donorEmail,
        donorPhone: donorPhone || '',
        isAnonymous: Boolean(isAnonymous),
        purpose: purpose || 'General Fund',
        message: message || '',
        status: 'success',
        channel: paymentChannel,
        paidAt,
        createdAt: new Date().toISOString(),
        paystackResponse: paystackData
      };

      const result = await saveDonation(donationData);

      return NextResponse.json({
        success: true,
        id: result.id,
        donation: donationData
      });
    }

    return NextResponse.json(
      { success: false, error: 'Could not verify payment.' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error in donations verify API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

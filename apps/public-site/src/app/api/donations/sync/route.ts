import { NextRequest, NextResponse } from 'next/server';
import { saveDonation, DonationRecord } from '@techinejigbo/firebase/src/firestore';

export async function POST(req: NextRequest) {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey || secretKey.includes('placeholder')) {
      return NextResponse.json(
        { success: false, error: 'PAYSTACK_SECRET_KEY is not configured.' },
        { status: 400 }
      );
    }

    // Fetch transactions from Paystack API (up to 100 most recent transactions)
    const response = await fetch('https://api.paystack.co/transaction?perPage=100', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!data.status || !Array.isArray(data.data)) {
      return NextResponse.json(
        { success: false, error: data.message || 'Failed to fetch transactions from Paystack' },
        { status: 400 }
      );
    }

    const transactions = data.data;
    let syncedCount = 0;

    for (const tx of transactions) {
      if (tx.status === 'success') {
        const reference = tx.reference;
        const metadata = tx.metadata || {};
        const customer = tx.customer || {};

        const amountInNgn = (Number(tx.amount) || 0) / 100;
        const donorEmail = customer.email || metadata.donorEmail || '';
        
        let donorName = metadata.donorName;
        if (!donorName) {
          const fullName = `${customer.first_name || ''} ${customer.last_name || ''}`.trim();
          donorName = fullName || 'Generous Supporter';
        }
        if (metadata.isAnonymous) {
          donorName = 'Anonymous Donor';
        }

        const donationData: Partial<DonationRecord> = {
          id: reference,
          reference,
          amount: amountInNgn,
          currency: tx.currency || 'NGN',
          donorName,
          donorEmail,
          donorPhone: metadata.donorPhone || customer.phone || '',
          isAnonymous: Boolean(metadata.isAnonymous),
          purpose: metadata.purpose || 'General Impact Fund',
          message: metadata.message || '',
          status: 'success',
          channel: tx.channel || 'card',
          paidAt: tx.paid_at || tx.paidAt || new Date().toISOString(),
          createdAt: tx.created_at || tx.createdAt || new Date().toISOString(),
          paystackResponse: tx
        };

        await saveDonation(donationData);
        syncedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      totalFound: transactions.length,
      syncedCount,
      message: `Successfully synchronized ${syncedCount} transaction(s) from Paystack.`
    });
  } catch (error: any) {
    console.error('Error syncing transactions from Paystack:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

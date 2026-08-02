// Paystack Helper Library for TechinEjigbo Donation

export interface PaystackPaymentOptions {
  key?: string;
  email: string;
  amount: number; // in NGN (Naira)
  reference?: string;
  currency?: string;
  metadata?: {
    custom_fields?: Array<{
      display_name: string;
      variable_name: string;
      value: string | number | boolean;
    }>;
    donorName?: string;
    donorPhone?: string;
    purpose?: string;
    isAnonymous?: boolean;
    message?: string;
    [key: string]: any;
  };
  onSuccess: (response: PaystackSuccessResponse) => void;
  onClose: () => void;
}

export interface PaystackSuccessResponse {
  reference: string;
  trans?: string;
  status?: string;
  message?: string;
  transaction?: string;
  trxref?: string;
}

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: any) => {
        openIframe: () => void;
      };
    };
  }
}

/**
 * Generates a unique transaction reference with a readable prefix
 */
export function generateDonationReference(prefix = 'TIE-DON'): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${randomStr}`;
}

/**
 * Format number into Nigerian Naira string (e.g. 5000 -> ₦5,000)
 */
export function formatCurrency(amount: number, currency = 'NGN'): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Dynamically loads the Paystack inline popup script
 */
export function loadPaystackScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if (window.PaystackPop) {
      resolve(true);
      return;
    }

    const existingScript = document.getElementById('paystack-inline-js');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.id = 'paystack-inline-js';
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Paystack inline JS SDK');
      resolve(false);
    };

    document.body.appendChild(script);
  });
}

/**
 * Opens Paystack checkout popup
 */
export async function initializePaystackDonation(options: PaystackPaymentOptions): Promise<boolean> {
  const isLoaded = await loadPaystackScript();

  if (!isLoaded || !window.PaystackPop) {
    throw new Error('Payment gateway could not be loaded. Please check your internet connection.');
  }

  const publicKey = options.key || process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_placeholder';
  const reference = options.reference || generateDonationReference();

  // Paystack expects amount in Kobo (1 NGN = 100 Kobo)
  const amountInKobo = Math.round(options.amount * 100);

  const handler = window.PaystackPop.setup({
    key: publicKey,
    email: options.email,
    amount: amountInKobo,
    currency: options.currency || 'NGN',
    ref: reference,
    metadata: options.metadata || {},
    callback: (response: PaystackSuccessResponse) => {
      options.onSuccess(response);
    },
    onClose: () => {
      options.onClose();
    }
  });

  handler.openIframe();
  return true;
}

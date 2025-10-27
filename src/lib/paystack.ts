

'use server';

interface PaystackInitializeOptions {
    email: string;
    amount: number; // in GHC
}

interface PaystackInitializeResponse {
    status: boolean;
    message: string;
    data: {
        authorization_url: string;
        access_code: string;
        reference: string;
    };
}

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "sk_test_123456789"; // Use environment variable
const PAYSTACK_API_BASE = "https://api.paystack.co";

export const payWithPaystack = async (options: PaystackInitializeOptions): Promise<{ authorization_url?: string }> => {
    try {
        const response = await fetch(`${PAYSTACK_API_BASE}/transaction/initialize`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: options.email,
                amount: options.amount * 100, // Convert to kobo/pesewas
                currency: 'GHS',
                // callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/verify`
            }),
        });

        const data: PaystackInitializeResponse = await response.json();

        if (data.status) {
            return { authorization_url: data.data.authorization_url };
        } else {
            console.error('Paystack initialization failed:', data.message);
            return {};
        }
    } catch (error) {
        console.error('Error initializing Paystack transaction:', error);
        return {};
    }
};

export const verifyPaystackTransaction = async (reference: string): Promise<boolean> => {
    try {
        const response = await fetch(`${PAYSTACK_API_BASE}/transaction/verify/${reference}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            },
        });

        const data = await response.json();
        return data.status && data.data.status === 'success';
    } catch (error) {
        console.error('Error verifying Paystack transaction:', error);
        return false;
    }
};


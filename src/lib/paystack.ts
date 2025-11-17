
'use server';

interface PaystackChargeOptions {
    email: string;
    amount: number; // in GHC
    mobile_money: {
        phone: string;
        provider: 'mtn' | 'vod' | 'atl' | any;
    };
}

interface PaystackChargeResponse {
    status: boolean;
    message: string;
    data: {
        reference: string;
        status: string; // e.g., 'send_otp', 'pay_offline', 'success'
        display_text: string;
    };
}

interface PaystackVerifyResponse {
    status: boolean;
    message: string;
    data: {
        status: 'success' | 'failed' | 'abandoned' | 'ongoing';
        reference: string;
        amount: number;
    }
}


const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "sk_test_ff440edc73d9bf19f3b691efd8b45ce2102ac1e7";
const PAYSTACK_API_BASE = "https://api.paystack.co";

export const chargeWithPaystack = async (options: PaystackChargeOptions): Promise<{ status: boolean, message: string, reference?: string }> => {
    try {
        const response = await fetch(`${PAYSTACK_API_BASE}/charge`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: options.email,
                amount: options.amount * 100, // Convert to pesewas
                currency: 'GHS',
                mobile_money: options.mobile_money,
            }),
            cache: 'no-store'
        });

        const data: PaystackChargeResponse = await response.json();

        if (data.status) {
            return { 
                status: true, 
                message: data.data.display_text || data.message, 
                reference: data.data.reference 
            };
        } else {
            console.error('Paystack charge failed:', data.message);
            return { status: false, message: data.message || "Payment initiation failed." };
        }
    } catch (error) {
        console.error('Error initiating Paystack charge:', error);
        return { status: false, message: "An unexpected error occurred." };
    }
};

export const verifyPaystackTransaction = async (reference: string): Promise<{ status: 'success' | 'failed' | 'pending' }> => {
    try {
        const response = await fetch(`${PAYSTACK_API_BASE}/transaction/verify/${reference}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            },
            cache: 'no-store'
        });

        const data: PaystackVerifyResponse = await response.json();

        if (data.status) {
            if (data.data.status === 'success') {
                return { status: 'success' };
            }
            if (data.data.status === 'failed' || data.data.status === 'abandoned') {
                return { status: 'failed' };
            }
            return { status: 'pending' };
        } else {
            return { status: 'failed' };
        }
    } catch (error) {
        console.error('Error verifying Paystack transaction:', error);
        return { status: 'failed' };
    }
};

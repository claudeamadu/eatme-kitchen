
interface PaystackPop {
    newTransaction(details: {
        key: string;
        email: string;
        amount: number;
        onSuccess: (transaction: any) => void;
        onCancel: () => void;
        onClose: () => void;
    }): void;
}

declare global {
    interface Window {
        PaystackPop: PaystackPop;
    }
}

interface PaystackOptions {
    email: string;
    amount: number;
    onSuccess: (transaction: any) => void;
    onClose: () => void;
}

const PAYSTACK_PUBLIC_KEY = "pk_test_7e7db3ece882c7aeff5a5cbbb820a9bd960d4005";

export const payWithPaystack = (options: PaystackOptions): void => {
    if (typeof window !== 'undefined' && window.PaystackPop) {
        const handler = new window.PaystackPop();
        handler.newTransaction({
            key: PAYSTACK_PUBLIC_KEY,
            email: options.email,
            amount: options.amount,
            onSuccess: options.onSuccess,
            onCancel: options.onClose, // onCancel is deprecated, use onClose
            onClose: options.onClose,
        });
    } else {
        console.error('Paystack script not loaded');
        alert('Payment service is currently unavailable. Please try again later.');
    }
};

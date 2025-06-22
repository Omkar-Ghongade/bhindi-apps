// import fetch from 'node-fetch';

import { time } from "console";

/**
 * Token for Cashfree API authentication
 */
interface CashfreeToken {
    xApiVersion: string;
    apiKey: string;
    apiSecret: string;
    // authorization: string;
}

/**
 * Required parameters for creating a payment link
 */
interface PaymentLinkParams {
    customer_email: string;
    link_amount: number;
    customer_name: string;
}

export class CashfreeService {
    /**
     * Create a payment link using Cashfree API
     * @param token - API credentials and version
     * @param params - Required payment link parameters
     */
    public async createPaymentLink(token: CashfreeToken, params: PaymentLinkParams) {
        console.log(token)
        
        // Generate the complete request body with default values
        const requestBody = {
            amount: params.link_amount.toString(),
            currency: "INR",
            customer_email: params.customer_email,
            customer_phone: "9999999999",
            customer_details: {
                customer_email: params.customer_email,
                customer_name: params.customer_name,
                customer_phone: "9999999999"
            },
            link_amount: params.link_amount,
            link_auto_reminders: true,
            link_currency: "INR",
            link_expiry_time: "2025-07-14T15:04:05+05:30",
            link_id: `link_${Date.now()}`,
            link_meta: {
                notify_url: "https://ee08e626ecd88c61c85f5c69c0418cb5.m.pipedream.net",
                return_url: "https://www.cashfree.com/devstudio/thankyou",
                upi_intent: false
            },
            link_minimum_partial_amount: 20,
            link_notes: {
                key_1: "value_1",
                key_2: "value_2"
            },
            link_notify: {
                send_email: true,
                send_sms: false
            },
            link_partial_payments: true,
            link_purpose: "Payment for PlayStation 11"
        };

        const options = {
            method: 'POST',
            headers: {
                // 'Authorization': `Bearer ${token.authorization}`,
                'x-api-version': token.xApiVersion,
                'x-client-id': token.apiKey,
                'x-client-secret': token.apiSecret,
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify(requestBody),
        };
        console.log('Creating payment link with options:', options);
        try {
            const response = await fetch('https://sandbox.cashfree.com/pg/links', options);
            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Cashfree API error: ${response.status} ${response.statusText} - ${errorData}`);
            }
            return await response.json();
        } catch (err: any) {
            throw new Error(`Failed to create payment link: ${err.message}`);
        }
    }
    // simple hello function
    public hello(): string {
        return 'Hello from CashfreeService!';
    }
}
# PAYME Payment Integration

This project provides a Node.js-based integration with the PayMe API for processing payments through multiple providers. It supports both sandbox and production environments, handles real-time payment status callbacks, and includes a fallback polling mechanism.

## Features

- **Seamless Environment Switching**: Easily switch between sandbox and production environments via environment variables.
- **Real-Time Callbacks**: Supports `providerCallbackHost` to receive real-time payment status updates.
- **Polling Mechanism**: A fallback polling mechanism for cases where callback notifications fail to get the final status of transactions.
- **API User and Key Management**: Automatically creates API users and keys in the sandbox environment after the onboarding process completed in the admin panel.
- **Unique Payment References**: Generates unique payment reference IDs using `uuidv4()` for each transaction.
- **Unique Payment Types**: Support many payment types related to the user experience
  - **Simple Payment** : This is when one user do one payment at a time
  - **Partial Payment** : This is to allow merchant to accept if a customer will do multiple payments for a specific product or service
  - **Group Payment** : This is when many customers are doing the same payment:

## Prerequisites

- Node.js (>= 20.x)
- NPM or Yarn
- PAYME API access (for both sandbox and production environments)

## Getting Started

### 1. Install the package in your project

```bash
npm install payme-sdk
```

### 2. Environment Configuration

Create a `.env` file in your project root and add the following variables:

```bash
# General Configuration

# Sandbox Configuration
BASE_URL_PAYMENT=https://payme-payment.your-sandbox-api-url.com/
BASE_URL_BILLING=https://payme-billing.your-sandbox-api-url.com/
BASE_URL_ONBOARDING=https://payme-onboard.your-sandbox-api-url.com/
SUBSCRIPTION_KEY_SANDBOX=<your_sandbox_subscription_key>
CALLBACK_HOST_SANDBOX=<your_sandbox_callback_url>
PAYME_CREDENTIAL_EMAIL=<your_sandbox_email>
PAYME_CREDENTIAL_PASSWORD=<your_sandbox_password>

# Production Configuration
BASE_URL_PAYMENT=https://payme-payment.your-production-api-url.com/
BASE_URL_BILLING=https://payme-billing.your-production-api-url.com/
BASE_URL_ONBOARDING=https://payme-onboard.your-production-api-url.com/
SUBSCRIPTION_KEY_SANDBOX=<your_production_subscription_key>
CALLBACK_HOST_SANDBOX=<your_production_callback_url>
PAYME_CREDENTIAL_EMAIL=<your_production_email>
PAYME_CREDENTIAL_PASSWORD=<your_production_password>
```

### 3. Running the Application

To test the integration in **sandbox** mode, ensure that the `PAYME_ENV` is set to `sandbox part` in your `.env` file.

```bash
npm start
```

### 4. Payment Processing

Use the provided `postPayment` and `postPaymentItem` functions to initiate a payment. Here's an example of how to call it:

```typescript
import PayMeSDK from 'payme-sdk';

const email = process.env.PAYME_CREDENTIAL_EMAIL;
const password = process.env.PAYME_CREDENTIAL_PASSWORD;
const subscriptionKey = process.env.PAYME_SUBSCRIPTION_KEY;
const sdk = new PayMeSDK(email, password, subscriptionKey);

await sdk.init();

const transaction = await sdk.postPayment({
  reference: 'TEST006',
  amount: 2000,
  fees: 50,
  tva: 5,
  description: 'First Bill Payment',
});
console.log(transaction);

const payment = await sdk.postPaymentItem({
  currency: 'XAF',
  customer_name: 'John',
  customer_email: 'Doe',
  customer_country: 'CM',
  amount: 1000,
  fees: 50,
  transaction_id: transaction.id,
  phone: '677777777',
});

console.log(payment);

```

## For Developers

### Different types declaration of the system

```typescript
type Payment = {
  reference: string;
  account_id: number;
  amount: number;
  fees: number;
  tva: number;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type PaymentItem = {
  reference: string;
  payment_id: number;
  customer_id: number;
  amount: number;
  fees: number;
  phone: string;
  payment_method: string;
  payment_proof: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type Fees = {
  operation_type: string;
  corridor_tag: string;
  operand: string;
  min_amount: number;
  max_amount: number;
  value: number;
};

interface PaymentParam {
  reference: string;
  amount: number;
  fees: number;
  tva: number;
  description: string;
}

interface PaymentItemParam {
  reference: string;
  currency: string;
  customer_name: string;
  customer_email: string;
  customer_country: string;
  amount: number;
  fees: number;
  transaction_id: number;
  phone: string;
}
```

### `getFees(amount: number, country: string): Promise<Pick<any, "operation_type" | "corridor_tag" | "operand" | "min_amount" | "max_amount" | "value">>;`
Given an amount, this function allow you to get the fees associated to an operation.

### `postPayment(param: PaymentParam): Promise<any>;`
Initiates the transaction request.

### `getPaymentStatus(reference: string): Promise<Pick<any, "reference" | "account_id" | "amount" | "fees" | "tva" | "description" | "status" | "created_at" | "updated_at">>;`
Initiates the payment request. Don't forget that a payment is related to a specific transaction

### `postPaymentItem(param: PaymentItemParam): Promise<any>;`
Retrieves the status of the transaction request.

### `getPaymentItemStatus(reference: string): Promise<Pick<any, "reference" | "amount" | "fees" | "status" | "created_at" | "updated_at" | "payment_id" | "customer_id" | "phone" | "payment_method" | "payment_proof">>;`
Retrieves the status of the payment request.

### `getPaymentWithItems(reference: string): Promise<Pick<any, "reference" | "account_id" | "amount" | "fees" | "tva" | "description" | "status" | "created_at" | "updated_at" | "payment_type" | "paymentItems">>;`
Polls for the transaction status and all his related payments.

## Error Handling

- In case of an error during API requests, detailed error responses are logged.
- If the callback URL fails, the fallback polling mechanism ensures that the payment status is eventually retrieved.

## Roadmap

- **Future Support**: Plans to expand SDK functionality to support other MoMo API features beyond collections, including disbursements and transfers.

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Official Documentation

For more information on the MTN MoMo API, please refer to the [official MTN MoMo developer documentation](https://momodeveloper.mtn.com).
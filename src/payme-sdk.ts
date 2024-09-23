// src/payme-sdk.ts

import * as dotenv from 'dotenv';
import * as _ from 'lodash';
import { ExternalDataService } from './services/external-data.service';

export type Payment = {
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

export type PaymentItem = {
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

export type Fees = {
  operation_type: string;
  corridor_tag: string;
  operand: string;
  min_amount: number;
  max_amount: number;
  value: number;
};

export interface PaymentParam {
  reference: string;
  amount: number;
  fees: number;
  tva: number;
  description: string;
}

export interface PaymentItemParam {
  reference?: string;
  currency?: string;
  customer_name?: string;
  customer_email?: string;
  customer_country?: string;
  amount: number;
  fees: number;
  transaction_id: number;
  phone: string;
}

class PayMeSDK {
  private email: string;
  private password: string;
  private apiKey: string;
  private merchant: any;
  private token: string;
  private account: any;
  private externalDataService: ExternalDataService;

  constructor(email: string, password: string, apiKey: string) {
    // Set up dotenv
    dotenv.config({ path: '.env' });

    this.email = email;
    this.password = password;
    this.apiKey = apiKey;
    this.token = '';
    this.externalDataService = new ExternalDataService();
  }

  /**
   * This function check if a merchant with a specific key exists
   * @param key apiKey of the merchant
   */
  public async init() {
    const resp =
      await this.externalDataService.postDataFromOnboarding(
        `users/developer/authenticate`,
        {
          email: this.email,
          password: this.password,
          subscription_key: this.apiKey,
        }
      );
    if (!resp || resp.length == 0) {
      throw new Error(
        'Unable to fetch account related to the key provided'
      );
    }
    this.merchant = resp.data.user;
    this.account = this.merchant.individualProfiles[0];
    this.token = resp.data.token;
    console.log(this.account, this.token);
    this.externalDataService.setToken(this.token);
  }

  /**
   * This function calculate the applicable fees of a payment
   * @param amount amount of the payment
   * @param country country where the payment will be done
   */
  async getFees(amount: number, country: string) {
    const resp = await this.externalDataService.getDataFromBilling(
      `fees?filter={"where":{"min_amount":{"lte": ${amount}},"max_amount":{"gt": ${amount}}}}`
    );
    if (!resp || resp.length == 0) {
      throw new Error(
        'Fees has not yet been define for this amount, please contact support'
      );
    }
    const fees = _.pick(resp[0], [
      'operation_type',
      'corridor_tag',
      'operand',
      'min_amount',
      'max_amount',
      'value',
    ]);
    return fees;
  }

  /**
   * This function register a payment / simple / partial / grouped
   * @param param payment parameters
   */
  async postPayment(param: PaymentParam) {
    let data = {
      ...param,
      account_id: this.account.id,
    };
    const resp = this.externalDataService.postDataFromPayment(
      'transactions',
      data
    );
    return resp;
  }

  /**
   * This function check the status of a payment
   * @param reference uniq reference of the transaction
   */
  async getPaymentStatus(reference: string) {
    const resp = await this.externalDataService.getDataFromPayment(
      `transactions?filter={"where":{"reference":"${reference}"}}`
    );
    if (!resp || resp.length == 0) {
      throw new Error(
        'Fees has not yet been define for this amount, please contact support'
      );
    }
    const payment = _.pick(resp[0], [
      'reference',
      'account_id',
      'amount',
      'fees',
      'tva',
      'description',
      'status',
      'created_at',
      'updated_at',
    ]);
    return payment;
  }

  /**
   * This function init the payment of a customer
   * @param param parameters of the item payment
   */
  async postPaymentItem(param: PaymentItemParam) {
    const resp = this.externalDataService.postDataFromPayment(
      'payment-items',
      param
    );
    return resp;
  }

  /**
   * This function check the status of a payment item
   * @param reference uniq reference of the payment item
   */
  async getPaymentItemStatus(reference: string) {
    const resp = await this.externalDataService.getDataFromPayment(
      `payment-items?filter={"where":{"reference":"${reference}"}}`
    );
    if (!resp || resp.length == 0) {
      throw new Error(
        'Fees has not yet been define for this amount, please contact support'
      );
    }
    const payment_item = _.pick(resp[0], [
      'reference',
      'payment_id',
      'customer_id',
      'amount',
      'fees',
      'phone',
      'payment_method',
      'payment_proof',
      'status',
      'created_at',
      'updated_at',
    ]);
    return payment_item;
  }

  /**
   * This function return the payment and his associated payment items
   * @param reference uniq reference of the payment
   */
  async getPaymentWithItems(reference: string) {
    const resp = await this.externalDataService.getDataFromPayment(
      `transactions?filter={"where":{"reference":"${reference}"}, "include":["paymentItems"]}`
    );
    if (!resp || resp.length == 0) {
      throw new Error('');
    }
    const payment = _.pick(resp[0], [
      'reference',
      'account_id',
      'payment_type',
      'amount',
      'fees',
      'tva',
      'description',
      'status',
      'created_at',
      'updated_at',
      'paymentItems',
    ]);
    const items = resp[0].paymentItems.map((item: any) =>
      _.pick(item, [
        'reference',
        'payment_id',
        'customer_id',
        'amount',
        'fees',
        'phone',
        'payment_method',
        'payment_proof',
        'status',
        'created_at',
        'updated_at',
      ])
    );
    payment.paymentItems = items;

    return payment;
  }
}

export default PayMeSDK;

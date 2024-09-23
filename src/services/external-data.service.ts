import axios from 'axios';
import * as dotenv from 'dotenv';
import * as https from 'https';

export class ExternalDataService {
  url_payment = process.env.BASE_URL_PAYMENT;
  url_onboard = process.env.BASE_URL_ONBOARDING;
  url_billing = process.env.BASE_URL_BILLING;

  protected token: string;

  httpsAgent = new https.Agent({
    rejectUnauthorized: false, // (NOTE: this will disable client verification)
  });

  api_billing = axios.create({
    baseURL: this.url_billing,
    httpsAgent: this.httpsAgent,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  api_onboarding = axios.create({
    baseURL: this.url_onboard,
    httpsAgent: this.httpsAgent,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  api_payment = axios.create({
    baseURL: this.url_payment,
    httpsAgent: this.httpsAgent,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    dotenv.config({ path: '.env' });
    this.token = '';
  }

  public getToken() {
    return this.token;
  }

  public setToken(token: string) {
    this.token = token;
  }

  async getDataFromBilling(path: string): Promise<any> {
    try {
      console.log('token', this.token);
      this.api_billing.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${this.token}`;
      const response = await this.api_billing.get(path);
      return response.data;
    } catch (error) {
      console.log('Failed to fetch data from Onboarding', error);
    }
  }

  async postDataFromOnboarding(
    path: string,
    body: any
  ): Promise<any> {
    try {
      this.api_onboarding.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${this.token}`;
      console.log('body', body);
      const response = await this.api_onboarding.post(path, body, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      const data = response.data;
      console.log(
        `Successfully fetched and cached data from Onboarding ${path}`
      );
      return data;
    } catch (error) {
      console.log('Failed to fetch data from Onboarding', error);
    }
  }

  async getDataFromOnboarding(path: string): Promise<any> {
    try {
      this.api_onboarding.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${this.token}`;
      const response = await this.api_onboarding.get(path);
      const data = response.data;
      return data;
    } catch (error) {
      console.log('Failed to fetch data from Onboarding', error);
    }
  }

  async getDataFromPayment(path: string): Promise<any> {
    try {
      this.api_payment.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${this.token}`;
      const response = await this.api_payment.get(path);
      const data = response.data;
      return data;
    } catch (error) {
      console.log('Failed to fetch data from Onboarding', error);
    }
  }

  async postDataFromPayment(path: string, body: any): Promise<any> {
    try {
      this.api_payment.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${this.token}`;
      console.log('body', body);
      const response = await this.api_payment.post(path, body, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      const data = response.data;
      console.log(`Successfully post data from Payment ${path}`);
      return data;
    } catch (error) {
      console.log('Failed to fetch data from Onboarding', error);
    }
  }
}

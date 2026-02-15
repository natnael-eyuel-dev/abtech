import axios from 'axios';
import { createHash, createSign, createVerify } from 'node:crypto';

interface TelebirrConfig {
  appId: string;
  appKey: string;
  merchantId: string;
  notifyUrl: string;
  returnUrl: string;
  shortCode: string;
  publicKey: string;
  privateKey: string;
  version: string;
}

interface TelebirrPaymentRequest {
  amount: number;
  phoneNumber: string;
  transactionId: string;
  description: string;
  callbackUrl: string;
}

interface TelebirrPaymentResponse {
  code: string;
  msg: string;
  data: {
    appId: string;
    merchantId: string;
    nonce: string;
    notifyUrl: string;
    orderNo: string;
    outTradeNo: string;
    payAmount: string;
    receiveAmount: string;
    shortCode: string;
    subject: string;
    timeoutExpress: string;
    timestamp: string;
    totalAmount: string;
    tradeType: string;
    userId: string;
    usdAmount: string;
    sign: string;
  };
}

interface TelebirrVerificationRequest {
  appId: string;
  merchantId: string;
  nonce: string;
  outTradeNo: string;
  timestamp: string;
  sign: string;
}

interface TelebirrVerificationResponse {
  code: string;
  msg: string;
  data: {
    appId: string;
    merchantId: string;
    nonce: string;
    notifyUrl: string;
    orderNo: string;
    outTradeNo: string;
    payAmount: string;
    receiveAmount: string;
    shortCode: string;
    subject: string;
    timeoutExpress: string;
    timestamp: string;
    totalAmount: string;
    tradeType: string;
    userId: string;
    usdAmount: string;
    tradeStatus: string;
    sign: string;
  };
}

class TelebirrService {
  private config: TelebirrConfig;
  private baseUrl: string;

  constructor() {
    this.config = {
      appId: process.env.TELEBIRR_APP_ID || '',
      appKey: process.env.TELEBIRR_APP_KEY || '',
      merchantId: process.env.TELEBIRR_MERCHANT_ID || '',
      notifyUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/telebirr/callback`,
      returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/billing`,
      shortCode: process.env.TELEBIRR_SHORT_CODE || '',
      publicKey: process.env.TELEBIRR_PUBLIC_KEY || '',
      privateKey: process.env.TELEBIRR_PRIVATE_KEY || '',
      version: process.env.TELEBIRR_VERSION || '1.0'
    };

    this.baseUrl = process.env.TELEBIRR_API_URL || 'https://api.telebirr.com/payment';
  }

  /**
   * Production-safe config check. (We avoid throwing at import time.)
   */
  isConfigured() {
    return Boolean(
      this.config.appId &&
      this.config.appKey &&
      this.config.merchantId &&
      this.config.shortCode &&
      process.env.NEXT_PUBLIC_BASE_URL
    );
  }

  /**
   * Whether RSA signing/verification keys are present.
   * Telebirr commonly provides a public key; for signing, you must provision your private key.
   */
  hasRsaKeys() {
    return Boolean(this.config.privateKey && this.config.publicKey);
  }

  private generateNonce(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private generateTimestamp(): string {
    return Date.now().toString();
  }

  private normalizePem(key: string, kind: 'public' | 'private') {
    const raw = String(key || '').trim();
    if (!raw) return '';
    const withNewlines = raw.replace(/\\n/g, '\n');
    if (withNewlines.includes('BEGIN')) return withNewlines;
    // Assume it's a base64 body without PEM armor.
    const body = withNewlines.replace(/\s+/g, '');
    const wrapped = body.match(/.{1,64}/g)?.join('\n') || body;
    if (kind === 'public') {
      return `-----BEGIN PUBLIC KEY-----\n${wrapped}\n-----END PUBLIC KEY-----\n`;
    }
    return `-----BEGIN PRIVATE KEY-----\n${wrapped}\n-----END PRIVATE KEY-----\n`;
  }

  /**
   * Create a deterministic string to sign: `key=value&key=value...` with keys sorted.
   * (Telebirr docs may have a specific canonicalization format; if yours differs,
   * adjust this function to match the official spec.)
   */
  private canonicalize(data: Record<string, any>) {
    const keys = Object.keys(data)
      .filter((k) => k !== 'sign' && data[k] !== undefined && data[k] !== null)
      .sort((a, b) => a.localeCompare(b));

    return keys
      .map((k) => {
        const v = data[k];
        const value = typeof v === 'object' ? JSON.stringify(v) : String(v);
        return `${k}=${value}`;
      })
      .join('&');
  }

  /**
   * Generate signature for requests.
   * - Preferred: RSA-SHA256 (base64) using TELEBIRR_PRIVATE_KEY
   * - Dev fallback: sha256(canonicalString) hex (NOT secure; do not use in production)
   */
  private generateSignature(data: Record<string, any>): string {
    const canonical = this.canonicalize(data);
    const privateKeyPem = this.normalizePem(this.config.privateKey, 'private');

    if (privateKeyPem) {
      const signer = createSign('RSA-SHA256');
      signer.update(canonical);
      signer.end();
      return signer.sign(privateKeyPem, 'base64');
    }

    // Fallback for local development only
    return createHash('sha256').update(canonical).digest('hex');
  }

  /**
   * Verify callback signature.
   * - Preferred: RSA-SHA256 using TELEBIRR_PUBLIC_KEY
   * - Dev fallback: sha256(canonicalString) hex (NOT secure)
   */
  private verifySignature(data: Record<string, any>, sign: string): boolean {
    const canonical = this.canonicalize(data);
    const publicKeyPem = this.normalizePem(this.config.publicKey, 'public');

    if (publicKeyPem) {
      try {
        const verifier = createVerify('RSA-SHA256');
        verifier.update(canonical);
        verifier.end();
        return verifier.verify(publicKeyPem, sign, 'base64');
      } catch (e) {
        console.error('Telebirr RSA signature verification error:', e);
        return false;
      }
    }

    // Fallback for local development only
    const expected = createHash('sha256').update(canonical).digest('hex');
    return expected === sign;
  }

  async initiatePayment(params: TelebirrPaymentRequest): Promise<{
    success: boolean;
    merchantTransactionId?: string;
    redirectUrl?: string;
    error?: string;
  }> {
    try {
      if (process.env.NODE_ENV === 'production') {
        if (!this.isConfigured()) {
          return { success: false, error: 'Telebirr is not configured' };
        }
        if (!this.config.privateKey) {
          return { success: false, error: 'Telebirr private key is missing (TELEBIRR_PRIVATE_KEY)' };
        }
      }

      const nonce = this.generateNonce();
      const timestamp = this.generateTimestamp();
      const outTradeNo = params.transactionId;

      const requestData = {
        appId: this.config.appId,
        merchantId: this.config.merchantId,
        nonce,
        notifyUrl: this.config.notifyUrl,
        orderNo: outTradeNo,
        outTradeNo,
        payAmount: params.amount.toString(),
        receiveAmount: params.amount.toString(),
        shortCode: this.config.shortCode,
        subject: params.description || 'Premium subscription',
        timeoutExpress: '30m',
        timestamp,
        totalAmount: params.amount.toString(),
        tradeType: 'PAY',
        userId: params.phoneNumber,
        usdAmount: (params.amount / 50).toString(), // Approximate conversion rate
      };

      const sign = this.generateSignature(requestData);

      const payload = {
        ...requestData,
        sign
      };

      const response = await axios.post<TelebirrPaymentResponse>(
        `${this.baseUrl}/create`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.appKey}`
          }
        }
      );

      if (response.data.code === 'SUCCESS') {
        // Generate redirect URL for Telebirr payment
        const redirectUrl = `https://open.telebirr.com/payment?appId=${this.config.appId}&merchantId=${this.config.merchantId}&outTradeNo=${outTradeNo}&nonce=${nonce}&timestamp=${timestamp}&sign=${sign}`;

        return {
          success: true,
          merchantTransactionId: response.data.data.outTradeNo,
          redirectUrl
        };
      } else {
        return {
          success: false,
          error: response.data.msg || 'Failed to initiate payment'
        };
      }
    } catch (error) {
      console.error('Telebirr payment initiation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment initiation failed'
      };
    }
  }

  async verifyPayment(transactionId: string): Promise<{
    success: boolean;
    status?: string;
    error?: string;
  }> {
    try {
      if (process.env.NODE_ENV === 'production' && !this.isConfigured()) {
        return { success: false, error: 'Telebirr is not configured' };
      }

      const nonce = this.generateNonce();
      const timestamp = this.generateTimestamp();

      const requestData = {
        appId: this.config.appId,
        merchantId: this.config.merchantId,
        nonce,
        outTradeNo: transactionId,
        timestamp
      };

      const sign = this.generateSignature(requestData);

      const payload = {
        ...requestData,
        sign
      };

      const response = await axios.post<TelebirrVerificationResponse>(
        `${this.baseUrl}/query`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.appKey}`
          }
        }
      );

      if (response.data.code === 'SUCCESS') {
        const tradeStatus = response.data.data.tradeStatus;
        return {
          success: true,
          status: tradeStatus === 'TRADE_SUCCESS' ? 'SUCCESS' : 'FAILED'
        };
      } else {
        return {
          success: false,
          error: response.data.msg || 'Payment verification failed'
        };
      }
    } catch (error) {
      console.error('Telebirr payment verification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment verification failed'
      };
    }
  }

  validateCallback(data: any): boolean {
    // Validate the callback signature to ensure it's from Telebirr
    try {
      const { sign, ...callbackData } = data;
      if (!sign) return false;

      // In production, require a public key for signature verification
      if (process.env.NODE_ENV === 'production' && !this.config.publicKey) {
        console.error('Telebirr callback rejected: TELEBIRR_PUBLIC_KEY is not configured');
        return false;
      }

      return this.verifySignature(callbackData, sign);
    } catch (error) {
      console.error('Callback validation error:', error);
      return false;
    }
  }
}

export const telebirrService = new TelebirrService();
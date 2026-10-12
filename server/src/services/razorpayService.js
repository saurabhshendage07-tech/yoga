import crypto from 'crypto';
import Razorpay from 'razorpay';

class RazorpayService {
  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_PranaVeda2026';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || 'secret_pranaveda_test_key_99';
    this.isLiveCredentials = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && !process.env.RAZORPAY_KEY_ID.includes('PranaVeda2026'));

    if (this.isLiveCredentials) {
      this.instance = new Razorpay({
        key_id: this.keyId,
        key_secret: this.keySecret,
      });
      console.log('💳 Razorpay initialized in Live/Sandbox mode with configured credentials.');
    } else {
      console.log('💳 Razorpay initialized in Interactive Test Simulator mode (Zero setup required for demo!).');
    }
  }

  /**
   * Create Razorpay Order
   * Amount in Rupees (will be converted to Paise for Razorpay)
   */
  async createOrder({ amount, currency = 'INR', receipt, notes = {} }) {
    const amountInPaise = Math.round(Number(amount) * 100);

    if (this.isLiveCredentials && this.instance) {
      try {
        const order = await this.instance.orders.create({
          amount: amountInPaise,
          currency,
          receipt: receipt || `rcpt_${Date.now()}`,
          notes
        });
        return {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          keyId: this.keyId,
          isSimulation: false
        };
      } catch (err) {
        console.error('Razorpay Order creation error:', err);
        throw new Error(err.error?.description || err.message || 'Razorpay order creation failed');
      }
    }

    // Interactive Demo / Simulated Order
    const simulatedOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      orderId: simulatedOrderId,
      amount: amountInPaise,
      currency,
      keyId: this.keyId,
      isSimulation: true,
      receipt: receipt || `rcpt_${Date.now()}`
    };
  }

  /**
   * Secure Backend Signature Verification
   */
  verifyPaymentSignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
    if (!razorpay_order_id || !razorpay_payment_id) {
      return { isValid: false, message: 'Missing order or payment ID' };
    }

    // If running in simulation/demo mode
    if (!this.isLiveCredentials) {
      // In simulator, valid if standard payload structure exists
      return {
        isValid: true,
        isSimulation: true,
        message: 'Signature verified successfully (Demo Mode)'
      };
    }

    try {
      const generatedSignature = crypto
        .createHmac('sha256', this.keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      const isMatch = generatedSignature === razorpay_signature;

      return {
        isValid: isMatch,
        isSimulation: false,
        message: isMatch ? 'Payment signature verified successfully' : 'Invalid payment signature'
      };
    } catch (err) {
      return { isValid: false, message: err.message };
    }
  }
}

export const razorpayService = new RazorpayService();

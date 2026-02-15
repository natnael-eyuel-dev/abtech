'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  X, 
  CreditCard, 
  Smartphone, 
  Crown, 
  Loader2,
  CheckCircle,
  XCircle,
  ArrowRight,
  Copy,
  ExternalLink
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  articleTitle?: string;
}

interface PaymentMethod {
  id: 'stripe' | 'telebirr';
  name: string;
  icon: React.ReactNode;
  description: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    icon: <CreditCard className="w-5 h-5" />,
    description: 'International payments with credit/debit cards. Supports subscriptions and one-time payments.'
  },
  {
    id: 'telebirr',
    name: 'Telebirr',
    icon: (
      <div className="relative">
        <Smartphone className="w-5 h-5" />
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
      </div>
    ),
    description: 'Ethiopia\'s favorite mobile payment. Fast, secure, and convenient.'
  }
];

const stripePlans = [
  {
    id: 'monthly',
    name: 'Monthly Subscription',
    price: '$9.99',
    period: '/month',
    description: 'Billed monthly, cancel anytime',
    priceId: 'price_monthly',
    paymentType: 'subscription' as const
  },
  {
    id: 'annual',
    name: 'Annual Subscription',
    price: '$95.99',
    period: '/year',
    description: 'Save 20% with annual billing',
    priceId: 'price_annual',
    paymentType: 'subscription' as const,
    badge: 'BEST VALUE'
  },
  {
    id: 'onetime',
    name: 'One-time Payment',
    price: '$4.99',
    period: '/30 days',
    description: '30 days premium access',
    priceId: 'price_onetime',
    paymentType: 'payment' as const
  }
];

const telebirrPlans = [
  { amount: '100', days: '30 days', description: '100 ETB - 30 days premium access' },
  { amount: '200', days: '60 days', description: '200 ETB - 60 days premium access' },
  { amount: '500', days: '180 days', description: '500 ETB - 180 days premium access' }
];

export default function PaymentModal({ isOpen, onClose, onSuccess, articleTitle }: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<'stripe' | 'telebirr'>('stripe');
  const [selectedPlan, setSelectedPlan] = useState(stripePlans[0]);
  const [telebirrPhone, setTelebirrPhone] = useState('');
  const [telebirrAmount, setTelebirrAmount] = useState('100');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<'method' | 'details' | 'processing'>('method');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [telebirrTransactionId, setTelebirrTransactionId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed' | 'failed'>('pending');
  const [statusCheckCount, setStatusCheckCount] = useState(0);

  // Phone number validation for Telebirr
  const isValidTelebirrPhone = (phone: string) => {
    // Accept formats: 2519xxxxxxxx, 09xxxxxxxx, +2519xxxxxxxx
    const cleanedPhone = phone.replace(/\s+/g, '');
    return /^(\+?251|0)?9\d{8}$/.test(cleanedPhone);
  };

  const formatTelebirrPhone = (phone: string) => {
    // Format to 2519xxxxxxxx for API
    const cleanedPhone = phone.replace(/\s+/g, '');
    if (cleanedPhone.startsWith('+251')) {
      return cleanedPhone.substring(1);
    } else if (cleanedPhone.startsWith('0')) {
      return '251' + cleanedPhone.substring(1);
    }
    return cleanedPhone;
  };

  const resetModal = () => {
    setSelectedMethod('stripe');
    setSelectedPlan(stripePlans[0]);
    setTelebirrPhone('');
    setTelebirrAmount('100');
    setLoading(false);
    setError(null);
    setPaymentStep('method');
    setIsProcessingPayment(false);
    setTelebirrTransactionId(null);
    setPaymentStatus('pending');
    setStatusCheckCount(0);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleStripePayment = async () => {
    setIsProcessingPayment(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: selectedPlan.priceId,
          paymentType: selectedPlan.paymentType
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Payment initiation failed');
      setIsProcessingPayment(false);
    }
  };

  const handleTelebirrPayment = async () => {
    setIsProcessingPayment(true);
    setError(null);

    try {
      const formattedPhone = formatTelebirrPhone(telebirrPhone);
      
      const response = await fetch('/api/payments/telebirr/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseInt(telebirrAmount),
          phoneNumber: formattedPhone,
          description: `Premium access for ${articleTitle || 'premium content'}`
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate Telebirr payment');
      }

      // Store transaction ID and move to processing step
      setTelebirrTransactionId(data.transactionId);
      setPaymentStep('processing');
      
      // Start polling for payment status
      pollPaymentStatus(data.transactionId);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Telebirr payment initiation failed');
      setIsProcessingPayment(false);
    }
  };

  const pollPaymentStatus = async (transactionId: string) => {
    const maxAttempts = 30; // 5 minutes of polling (10 seconds interval)
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/payments/telebirr/status?transactionId=${transactionId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to check payment status');
        }

        setStatusCheckCount(prev => prev + 1);

        if (data.payment.status === 'COMPLETED') {
          setPaymentStatus('completed');
          setIsProcessingPayment(false);
          onSuccess?.();
          // Auto-close modal after successful payment
          setTimeout(() => {
            handleClose();
          }, 2000);
        } else if (data.payment.status === 'FAILED') {
          setPaymentStatus('failed');
          setIsProcessingPayment(false);
          setError('Payment failed. Please try again.');
        } else if (attempts < maxAttempts) {
          // Continue polling
          attempts++;
          setTimeout(checkStatus, 10000); // Check every 10 seconds
        } else {
          // Timeout
          setPaymentStatus('failed');
          setIsProcessingPayment(false);
          setError('Payment verification timeout. Please check your payment status manually.');
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(checkStatus, 10000);
        } else {
          setPaymentStatus('failed');
          setIsProcessingPayment(false);
          setError('Failed to check payment status. Please contact support.');
        }
      }
    };

    // Start polling
    checkStatus();
  };

  const handlePayment = async () => {
    if (selectedMethod === 'stripe') {
      await handleStripePayment();
    } else {
      await handleTelebirrPayment();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-background border rounded-lg shadow-xl"
        >
          {/* Header */}
          <div className="sticky top-0 bg-background border-b p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Crown className="w-6 h-6 text-yellow-500" />
                  Unlock Premium Content
                </h2>
                {articleTitle && (
                  <p className="text-muted-foreground mt-1">
                    Access "{articleTitle}" and all premium articles
                  </p>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={handleClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Error Message */}
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Step 1: Payment Method Selection */}
            {paymentStep === 'method' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Choose Payment Method</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paymentMethods.map((method) => (
                      <Card
                        key={method.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedMethod === method.id
                            ? method.id === 'telebirr'
                              ? 'border-green-500 bg-gradient-to-r from-green-50 to-yellow-50 shadow-lg'
                              : 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedMethod(method.id)}
                      >
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2">
                            {method.icon}
                            {method.name}
                            {method.id === 'telebirr' && (
                              <Badge className="bg-gradient-to-r from-green-600 to-yellow-500 text-white text-xs">
                                Ethiopia's #1
                              </Badge>
                            )}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            {method.description}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button onClick={() => setPaymentStep('details')}>
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Payment Details */}
            {paymentStep === 'details' && (
              <div className="space-y-6">
                {/* Selected Method */}
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  {paymentMethods.find(m => m.id === selectedMethod)?.icon}
                  <span className="font-medium">
                    {paymentMethods.find(m => m.id === selectedMethod)?.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPaymentStep('method')}
                    className="ml-auto"
                  >
                    Change
                  </Button>
                </div>

                {/* Stripe Plans */}
                {selectedMethod === 'stripe' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Choose Your Plan</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {stripePlans.map((plan) => (
                        <Card
                          key={plan.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedPlan.id === plan.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedPlan(plan)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-lg">{plan.name}</CardTitle>
                                <CardDescription>{plan.description}</CardDescription>
                              </div>
                              {plan.badge && (
                                <Badge className="bg-green-500">{plan.badge}</Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-bold">{plan.price}</span>
                              <span className="text-muted-foreground">{plan.period}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Telebirr Plans */}
                {selectedMethod === 'telebirr' && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-600 via-yellow-500 to-red-600 mb-4">
                        <Smartphone className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Pay with Telebirr</h3>
                      <p className="text-gray-600">Fast, secure mobile payments from Ethiopia</p>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-yellow-50 rounded-lg p-6 border border-green-200">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                        Choose Your Premium Access
                      </h4>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="amount" className="text-gray-700 font-medium">Select Package</Label>
                          <Select value={telebirrAmount} onValueChange={setTelebirrAmount}>
                            <SelectTrigger className="mt-1 border-green-200 focus:border-green-500 focus:ring-green-500">
                              <SelectValue placeholder="Choose your package" />
                            </SelectTrigger>
                            <SelectContent>
                              {telebirrPlans.map((plan) => (
                                <SelectItem key={plan.amount} value={plan.amount}>
                                  <div className="flex items-center justify-between w-full">
                                    <span className="font-medium">{plan.amount} ETB</span>
                                    <span className="text-sm text-gray-500 ml-2">{plan.days}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-green-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Selected Package:</span>
                            <span className="font-bold text-lg text-green-700">
                              {telebirrAmount} ETB
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {telebirrPlans.find(p => p.amount === telebirrAmount)?.description}
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="phone" className="text-gray-700 font-medium">
                            Telebirr Phone Number
                          </Label>
                          <div className="relative mt-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">🇪🇹</span>
                            </div>
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="0912345678 or 251912345678"
                              value={telebirrPhone}
                              onChange={(e) => setTelebirrPhone(e.target.value)}
                              className="pl-10 border-green-200 focus:border-green-500 focus:ring-green-500"
                            />
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            {telebirrPhone && (
                              <>
                                {isValidTelebirrPhone(telebirrPhone) ? (
                                  <>
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span className="text-sm text-green-600">Valid phone number</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-4 h-4 text-red-500" />
                                    <span className="text-sm text-red-600">
                                      Please enter a valid Ethiopian phone number
                                    </span>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Accepted formats: 0912345678, 251912345678, or +251912345678
                          </p>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <div className="text-blue-600 mt-0.5">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="text-sm text-blue-800">
                              <strong>How it works:</strong> After payment, you'll receive an SMS confirmation and get instant access to premium content.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between gap-3">
                  <Button variant="outline" onClick={() => setPaymentStep('method')}>
                    Back
                  </Button>
                  <Button
                    onClick={handlePayment}
                    disabled={
                      isProcessingPayment ||
                      (selectedMethod === 'telebirr' && (!telebirrPhone || !isValidTelebirrPhone(telebirrPhone)))
                    }
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Pay with {selectedMethod === 'stripe' ? 'Stripe' : 'Telebirr'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Processing Payment */}
            {paymentStep === 'processing' && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-600 via-yellow-500 to-red-600 mb-4">
                    <Smartphone className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Processing Telebirr Payment</h3>
                  <p className="text-gray-600">Please complete the payment on your phone</p>
                </div>

                {/* Transaction Details */}
                <div className="bg-gradient-to-r from-green-50 to-yellow-50 rounded-lg p-6 border border-green-200">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Transaction ID:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{telebirrTransactionId}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(telebirrTransactionId || '');
                          }}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-bold text-lg text-green-700">{telebirrAmount} ETB</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Phone Number:</span>
                      <span className="font-medium">{telebirrPhone}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Status:</span>
                      <div className="flex items-center gap-2">
                        {paymentStatus === 'pending' && (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                            <span className="text-blue-600">Pending</span>
                          </>
                        )}
                        {paymentStatus === 'completed' && (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-green-600">Completed</span>
                          </>
                        )}
                        {paymentStatus === 'failed' && (
                          <>
                            <XCircle className="w-4 h-4 text-red-500" />
                            <span className="text-red-600">Failed</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Next Steps:</h4>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Open your Telebirr app on your phone</li>
                    <li>Look for the payment notification</li>
                    <li>Confirm the payment with your PIN</li>
                    <li>Wait for the confirmation message</li>
                  </ol>
                </div>

                {/* Status Check Info */}
                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Checking payment status... ({statusCheckCount}/30 attempts)
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${(statusCheckCount / 30) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setPaymentStep('details');
                      setIsProcessingPayment(false);
                      setPaymentStatus('pending');
                      setStatusCheckCount(0);
                    }}
                  >
                    Back
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleClose}
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}

            {/* Benefits */}
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Premium Benefits:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Unlimited access to all premium articles
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Ad-free reading experience
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Exclusive content and early access
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Priority customer support
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
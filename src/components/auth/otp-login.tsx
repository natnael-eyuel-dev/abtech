'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, Shield, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { signIn } from 'next-auth/react'
import { CaptchaTurnstile } from '@/components/shared/CaptchaTurnstile'

interface OTPLoginProps {
  onSuccess?: () => void
}

export function OTPLogin({ onSuccess }: OTPLoginProps) {
  const [currentStep, setCurrentStep] = useState<'request' | 'verify'>('request')
  const [email, setEmail] = useState('')
  const [otp, setOTP] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [hp, setHp] = useState('')
  const requireCaptcha = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"
  const { toast } = useToast()

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, captchaToken, honeypot: hp }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to send OTP')
        return
      }

      setSuccess(data.message)

      // Move to verification step
      setCurrentStep('verify')

    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // First, verify the OTP
      const verifyResponse = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      })

      const verifyData = await verifyResponse.json()

      if (!verifyResponse.ok) {
        setError(verifyData.error || 'Invalid OTP')
        return
      }

      // OTP is valid, now create the session using NextAuth
      const result = await signIn('credentials', {
        email,
        password: 'otp-auth', // This matches our special case in auth config
        otpLoginToken: verifyData.loginToken,
        redirect: false,
      })

      if (result?.error) {
        setError('Authentication failed')
        return
      }

      // Success - show success message and redirect
      toast({
        title: "Welcome!",
        description: "You have been successfully signed in.",
      })
      
      onSuccess?.()
      router.push(callbackUrl)
      router.refresh()

    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setResendLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, captchaToken, honeypot: hp }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to resend OTP')
        return
      }

      // Show success message
      setError('New OTP sent to your email!')

    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '') // Only allow digits
    setOTP(value.slice(0, 6)) // Limit to 6 digits
  }

  const handleBack = () => {
    setCurrentStep('request')
    setError(null)
    setSuccess(null)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {currentStep === 'request' ? (
        <form onSubmit={handleRequestOTP} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          {/* Honeypot */}
          <input
            type="text"
            value={hp}
            onChange={(e) => setHp(e.target.value)}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden
          />

          {/* Captcha */}
          {requireCaptcha && (
            <CaptchaTurnstile onToken={setCaptchaToken} />
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || !email || (requireCaptcha && !captchaToken)}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending OTP...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Send OTP
              </>
            )}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">One-Time Password</Label>
            <Input
              id="otp"
              type="text"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={handleOTPChange}
              maxLength={6}
              pattern="\d{6}"
              required
              disabled={isLoading}
              className="text-center text-lg tracking-widest"
            />
          </div>

          {/* Honeypot */}
          <input
            type="text"
            value={hp}
            onChange={(e) => setHp(e.target.value)}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden
          />

          {/* Captcha (required when configured; mainly for resend) */}
          {requireCaptcha && (
            <CaptchaTurnstile onToken={setCaptchaToken} />
          )}

          {error && (
            <Alert variant={error.includes('sent') ? 'default' : 'destructive'}>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleBack}
              disabled={isLoading}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify OTP'
              )}
            </Button>
          </div>

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={handleResendOTP}
              disabled={resendLoading || isLoading || (requireCaptcha && !captchaToken)}
              className="text-sm"
            >
              {resendLoading ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Sending...
                </>
              ) : (
                "Didn't receive the code? Resend"
              )}
            </Button>
          </div>
        </form>
      )}
    </motion.div>
  )
}
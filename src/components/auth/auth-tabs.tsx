'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Mail, Lock, Shield } from 'lucide-react'

interface AuthTabsProps {
  socialContent?: React.ReactNode
  emailContent: React.ReactNode
  otpContent: React.ReactNode
  footerContent?: React.ReactNode
}

export function AuthTabs({ socialContent, emailContent, otpContent, footerContent }: AuthTabsProps) {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Social Login Buttons */}
          {socialContent && (
            <div className="space-y-4 mb-6">
              {socialContent}
            </div>
          )}
          
          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>
          
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="otp" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                OTP
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="email" className="mt-4">
              {emailContent}
            </TabsContent>
            
            <TabsContent value="otp" className="mt-4">
              {otpContent}
            </TabsContent>
          </Tabs>
        </CardContent>
        {footerContent && (
          <CardFooter className="pt-6 border-t">
            {footerContent}
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
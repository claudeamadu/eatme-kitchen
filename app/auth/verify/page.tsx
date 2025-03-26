"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { auth } from "@/lib/firebase"
import { sendEmailVerification, onAuthStateChanged, signOut } from "firebase/auth"
import { toast } from "@/hooks/use-toast"

export default function VerifyPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [verificationCode, setVerificationCode] = useState(["", "", "", ""])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // No user is signed in, redirect to login
        router.push("/auth/login")
      } else if (user.emailVerified) {
        // User is already verified, sign them out and redirect to login
        signOut(auth).then(() => {
          router.push("/auth/login")
        })
      }
    })

    return () => unsubscribe()
  }, [router])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleResendCode = async () => {
    if (countdown > 0) return

    setIsResending(true)
    try {
      const user = auth.currentUser
      if (user) {
        await sendEmailVerification(user)
        setCountdown(60) // 60 seconds cooldown
        toast({
          title: "Verification email sent",
          description: "Please check your email for the verification link",
        })
      } else {
        throw new Error("No user is currently signed in")
      }
    } catch (error) {
      console.error("Failed to resend verification email:", error)
      toast({
        title: "Failed to send verification email",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
  }

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.charAt(0)
    }

    const newVerificationCode = [...verificationCode]
    newVerificationCode[index] = value
    setVerificationCode(newVerificationCode)

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`code-${index + 1}`)
      if (nextInput) {
        nextInput.focus()
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`)
      if (prevInput) {
        prevInput.focus()
      }
    }
  }

  const handleVerify = async () => {
    setIsLoading(true)

    try {
      // Check if user is still logged in
      const user = auth.currentUser
      if (user) {
        // Reload user to check if they've verified their email
        await user.reload()
        if (user.emailVerified) {
          // Sign out the user and redirect to login page
          await signOut(auth)
          toast({
            title: "Email verified successfully",
            description: "Please log in with your verified account",
          })
          router.push("/auth/login")
        } else {
          toast({
            title: "Email not verified",
            description: "Please click the verification link in your email",
            variant: "destructive",
          })
        }
      } else {
        router.push("/auth/login")
      }
    } catch (error) {
      console.error("Verification failed:", error)
      toast({
        title: "Verification failed",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col relative">
      <div className="absolute inset-0 z-0">
        <Image src="/images/background.png" alt="Background pattern" fill className="object-cover" />
      </div>

      <div className="z-10 flex-1 flex flex-col p-8">
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <div className="mb-8 flex justify-center">
            <Image
              src="/images/logo.png"
              alt="EatMe Kitchen Logo"
              width={150}
              height={150}
              className="object-contain"
              priority
            />
          </div>

          <h1 className="text-3xl font-bold text-center mb-2">Verify Your Email</h1>
          <p className="text-center text-gray-600 mb-8">
            We&apos;ve sent a verification link to your email address. Please check your inbox and click the link to
            verify your account.
          </p>

          <div className="bg-white p-6 rounded-xl shadow-md mb-6">
            <p className="text-center text-gray-700 mb-4">
              After clicking the verification link, click the button below to continue:
            </p>

            <Button
              onClick={handleVerify}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-6 rounded-xl text-xl"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "I've Verified My Email"
              )}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-gray-600 mb-4">Didn&apos;t receive the email?</p>
            <Button
              variant="outline"
              onClick={handleResendCode}
              disabled={isResending || countdown > 0}
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : countdown > 0 ? (
                `Resend in ${countdown}s`
              ) : (
                "Resend Verification Email"
              )}
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}


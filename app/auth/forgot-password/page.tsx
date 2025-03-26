"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { Loader2, ArrowLeft } from "lucide-react"
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { toast } from "@/hooks/use-toast"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await sendPasswordResetEmail(auth, email)
      setIsSuccess(true)
      toast({
        title: "Reset email sent",
        description: "Check your email for password reset instructions",
      })
    } catch (error: any) {
      console.error("Password reset failed:", error)
      let errorMessage = "Failed to send reset email. Please try again."

      if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address."
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email."
      }

      setError(errorMessage)
      toast({
        title: "Reset failed",
        description: errorMessage,
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

          <h1 className="text-3xl font-bold text-center mb-2">Reset Password</h1>
          <p className="text-center text-gray-600 mb-8">
            {isSuccess
              ? "Check your email for reset instructions"
              : "Enter your email to receive a password reset link"}
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
          )}

          {isSuccess ? (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              <p>
                We&apos;ve sent a password reset link to <strong>{email}</strong>.
              </p>
              <p className="mt-2">Please check your email and follow the instructions to reset your password.</p>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="py-6 px-4 rounded-xl"
                  disabled={isLoading}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white py-6 rounded-xl text-xl"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>
          )}

          <div className="mt-6 flex justify-center">
            <Link href="/auth/login" className="flex items-center text-red-600 hover:underline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}


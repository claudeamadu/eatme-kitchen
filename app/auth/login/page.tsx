"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { Loader2 } from "lucide-react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { toast } from "@/hooks/use-toast"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await signInWithEmailAndPassword(auth, email, password)
      toast({
        title: "Login successful",
        description: "Welcome back to EatMe Kitchen!",
      })
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Login failed:", error)
      let errorMessage = "Failed to login. Please try again."

      if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address."
      } else if (error.code === "auth/user-disabled") {
        errorMessage = "This account has been disabled."
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email."
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password."
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed login attempts. Please try again later."
      }

      setError(errorMessage)
      toast({
        title: "Login failed",
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

          <h1 className="text-3xl font-bold text-center mb-2">Let&apos;s Log you in</h1>
          <p className="text-center text-gray-600 mb-8">Welcome Back</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="py-6 px-4 rounded-xl"
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="py-6 px-4 rounded-xl"
                disabled={isLoading}
                required
              />
            </div>

            <div className="flex justify-end">
              <Link href="/auth/forgot-password" className="text-sm text-red-600 hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white py-6 rounded-xl text-xl"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Log In"
              )}
            </Button>
          </form>

          <p className="text-center mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-red-600 font-semibold">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}


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
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, setDoc } from "firebase/firestore"
import { toast } from "@/hooks/use-toast"

export default function SignupPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Update profile with username
      await updateProfile(user, {
        displayName: username,
      })

      // Store additional user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        username,
        email,
        phoneNumber,
        createdAt: new Date().toISOString(),
        loyaltyPoints: 0,
        orders: [],
        reservations: [],
      })

      toast({
        title: "Account created successfully",
        description: "Welcome to EatMe Kitchen!",
      })

      // Navigate to verification page
      router.push("/auth/verify")
    } catch (error: any) {
      console.error("Signup failed:", error)
      let errorMessage = "Failed to create account. Please try again."

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Email already in use. Please use a different email or login."
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address."
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak. Please use a stronger password."
      } else if (error.code === "auth/operation-not-allowed") {
        errorMessage = "Account creation is disabled. Please contact support."
      }

      setError(errorMessage)
      toast({
        title: "Signup failed",
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

          <h1 className="text-3xl font-bold text-center mb-2">Let&apos;s Get Started</h1>
          <p className="text-center text-gray-600 mb-8">Create an account to continue</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
          )}

          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Please enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="py-6 px-4 rounded-xl"
                disabled={isLoading}
                required
              />
            </div>

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

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
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
                  Signing Up...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>

          <p className="text-center mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-red-600 font-semibold">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}


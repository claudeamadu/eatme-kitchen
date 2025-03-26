"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BottomNav } from "@/components/bottom-nav"
import { auth } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"

export default function ReservationDetailsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [reservationDetails, setReservationDetails] = useState<any>(null)

  // Get user details if logged in
  useEffect(() => {
    const user = auth.currentUser
    if (user) {
      setName(user.displayName || "")

      // Get reservation details from session storage
      const storedDetails = sessionStorage.getItem("reservationDetails")
      if (storedDetails) {
        const details = JSON.parse(storedDetails)
        setReservationDetails(details)
      }
    } else {
      // If not logged in, redirect to login
      toast({
        title: "Authentication Required",
        description: "Please log in to make a reservation",
        variant: "destructive",
      })
      router.push("/auth/login")
    }
  }, [router, toast])

  const handleContinue = () => {
    if (!name || !phoneNumber) return

    // Store reservation details in session storage
    const updatedDetails = {
      ...reservationDetails,
      name,
      phone: phoneNumber,
    }

    sessionStorage.setItem("reservationDetails", JSON.stringify(updatedDetails))
    router.push("/table-reservation/review")
  }

  return (
    <main className="flex min-h-screen flex-col pb-16">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <Image src="/images/background.png" alt="Background pattern" fill className="object-cover" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-4 flex items-center bg-white bg-opacity-90">
        <Button variant="outline" size="icon" className="mr-2 rounded-full bg-white" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Reservation Details</h1>
      </header>

      {/* Contact Form */}
      <section className="relative z-10 px-4 flex-1">
        <div className="space-y-6 mt-4">
          {/* Name */}
          <div>
            <p className="text-sm text-gray-500 mb-2">Name</p>
            <Input
              type="text"
              placeholder="Full Name"
              className="py-6 px-4 rounded-xl bg-white"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Phone Number */}
          <div>
            <p className="text-sm text-gray-500 mb-2">Phone Number</p>
            <Input
              type="tel"
              placeholder="Phone Number"
              className="py-6 px-4 rounded-xl bg-white"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Continue Button */}
      <section className="relative z-10 px-4 py-6">
        <Button
          className="w-full bg-red-600 hover:bg-red-700 text-white py-6 rounded-full text-xl shadow-md"
          onClick={handleContinue}
          disabled={!name || !phoneNumber}
        >
          Continue
        </Button>
      </section>

      <BottomNav active="home" />
    </main>
  )
}


"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { BottomNav } from "@/components/bottom-nav"
import { useToast } from "@/hooks/use-toast"

export default function ReviewSummaryPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [reservationDetails, setReservationDetails] = useState<any>({
    date: "24 October, 2024",
    time: "10:00AM",
    duration: "3hrs",
    guests: "9-15 guests",
    occasion: "Birthday",
    name: "James Quansah",
    email: "Jamesquansah@gmail.com",
    phone: "0551234569",
    pricing: {
      duration: 50,
      guests: 500,
      total: 550,
    },
  })

  // Get reservation details from session storage
  useEffect(() => {
    const storedDetails = sessionStorage.getItem("reservationDetails")
    if (storedDetails) {
      const details = JSON.parse(storedDetails)

      // Calculate pricing based on duration and guests
      let durationPrice = 50
      if (details.duration === "1hr") durationPrice = 50
      else if (details.duration === "2hrs") durationPrice = 100
      else if (details.duration === "3hrs") durationPrice = 150
      else if (details.duration === "4hrs") durationPrice = 200
      else if (details.duration === "5hrs") durationPrice = 250
      else if (details.duration === "All Day") durationPrice = 500

      let guestsPrice = 0
      if (details.guests === "2-4 guests") guestsPrice = 200
      else if (details.guests === "5-8 guests") guestsPrice = 350
      else if (details.guests === "9-15 guests") guestsPrice = 500

      const totalPrice = durationPrice + guestsPrice

      setReservationDetails({
        ...details,
        pricing: {
          duration: durationPrice,
          guests: guestsPrice,
          total: totalPrice,
        },
      })
    } else {
      // If no details found, redirect back to reservation page
      toast({
        title: "Error",
        description: "Reservation details not found. Please try again.",
        variant: "destructive",
      })
      router.push("/table-reservation")
    }
  }, [router, toast])

  // Update the handleProceedToPayment function to navigate to the payment page
  const handleProceedToPayment = () => {
    router.push("/table-reservation/payment")
  }

  return (
    <main className="flex min-h-screen flex-col pb-16">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image src="/images/background.png" alt="Background pattern" fill className="object-cover" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-4 flex items-center bg-white bg-opacity-90">
        <Button variant="outline" size="icon" className="mr-2 rounded-full bg-white" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Review Summary</h1>
      </header>

      {/* Reservation Summary */}
      <section className="relative z-10 px-4 flex-1">
        <div className="bg-white rounded-lg p-4">
          {/* Booking Details */}
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-500">Booking for</span>
              <span className="font-medium">{reservationDetails.date}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Time</span>
              <span className="font-medium">{reservationDetails.time}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Reservation duration</span>
              <span className="font-medium">{reservationDetails.duration}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Number of guests</span>
              <span className="font-medium">{reservationDetails.guests}</span>
            </div>

            {reservationDetails.occasion && (
              <div className="flex justify-between">
                <span className="text-gray-500">Occasion</span>
                <span className="font-medium">{reservationDetails.occasion}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-gray-500">Name</span>
              <span className="font-medium">{reservationDetails.name}</span>
            </div>

            {reservationDetails.email && (
              <div className="flex justify-between">
                <span className="text-gray-500">Email</span>
                <span className="font-medium">{reservationDetails.email}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-gray-500">Phone Number</span>
              <span className="font-medium">{reservationDetails.phone}</span>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Pricing */}
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-500">Duration</span>
              <span className="font-medium">GHC {reservationDetails.pricing.duration}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Number of guests</span>
              <span className="font-medium">GHC {reservationDetails.pricing.guests}</span>
            </div>

            <div className="flex justify-between font-bold text-lg">
              <span>TOTAL</span>
              <span>GHC {reservationDetails.pricing.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <p className="text-orange-500 text-sm mt-4">Please note that reservations are confirmed after payment.</p>
      </section>

      {/* Proceed Button */}
      <section className="relative z-10 px-4 py-6">
        <Button
          className="w-full bg-red-600 hover:bg-red-700 text-white py-6 rounded-full text-xl"
          onClick={handleProceedToPayment}
        >
          Proceed to Payment
        </Button>
      </section>

      <BottomNav active="home" />
    </main>
  )
}


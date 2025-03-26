"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { BottomNav } from "@/components/bottom-nav"
import { ReservationConfirmingDialog } from "@/components/reservation-confirming-dialog"
import { ReservationConfirmedDialog } from "@/components/reservation-confirmed-dialog"
import { auth, db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"

export default function ReservationPaymentPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null)
  const [showConfirmingDialog, setShowConfirmingDialog] = useState(false)
  const [showConfirmedDialog, setShowConfirmedDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [reservationId, setReservationId] = useState<string | null>(null)
  const [reservationDetails, setReservationDetails] = useState<any>(null)
  const [amount, setAmount] = useState(550)
  const [fee, setFee] = useState(0)
  const [levy, setLevy] = useState(0)
  const [total, setTotal] = useState(550)

  // Get reservation details from session storage
  useEffect(() => {
    const storedDetails = sessionStorage.getItem("reservationDetails")
    if (storedDetails) {
      const details = JSON.parse(storedDetails)
      setReservationDetails(details)

      // Set the amount based on the calculated price from the reservation page
      if (details.totalPrice) {
        setAmount(details.totalPrice)
        setTotal(details.totalPrice + fee + levy)
      }
    } else {
      // If no details found, redirect back to reservation page
      toast({
        title: "Error",
        description: "Reservation details not found. Please try again.",
        variant: "destructive",
      })
      router.push("/table-reservation")
    }
  }, [router, toast, fee, levy])

  const handleConfirmBooking = async () => {
    if (!paymentMethod || !reservationDetails) return

    setIsProcessing(true)
    setShowConfirmingDialog(true)

    try {
      const user = auth.currentUser

      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to make a reservation",
          variant: "destructive",
        })
        setShowConfirmingDialog(false)
        setIsProcessing(false)
        router.push("/auth/login")
        return
      }

      // Create a new reservation in Firestore
      const reservationData = {
        userId: user.uid,
        userEmail: user.email,
        userName: reservationDetails.name || user.displayName,
        userPhone: reservationDetails.phone,
        date: reservationDetails.date,
        time: reservationDetails.time,
        duration: reservationDetails.duration,
        guests: reservationDetails.guests,
        occasion: reservationDetails.occasion,
        specialInstructions: reservationDetails.specialInstructions,
        status: "Upcoming",
        paymentMethod: paymentMethod,
        durationPrice: reservationDetails.durationPrice || 0,
        guestsPrice: reservationDetails.guestsPrice || 0,
        amount: amount,
        fee: fee,
        levy: levy,
        total: total,
        reservationNumber: `R${Math.floor(100000 + Math.random() * 900000)}`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      // Add the reservation to Firestore
      const docRef = await addDoc(collection(db, "reservations"), reservationData)
      setReservationId(docRef.id)

      // Simulate payment processing
      setTimeout(() => {
        setShowConfirmingDialog(false)
        setShowConfirmedDialog(true)
        setIsProcessing(false)
      }, 2000)
    } catch (error) {
      console.error("Error creating reservation:", error)
      setShowConfirmingDialog(false)
      setIsProcessing(false)
      toast({
        title: "Error",
        description: "Failed to create reservation. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Update the handleReservationConfirmed function to navigate to the reservations page
  const handleReservationConfirmed = () => {
    // Clear the reservation details from session storage
    sessionStorage.removeItem("reservationDetails")
    router.push("/reservations")
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
        <h1 className="text-xl font-bold">Payment</h1>
      </header>

      {/* Payment Card */}
      <section className="relative z-10 px-4 flex-1">
        <div className="bg-white rounded-lg p-4">
          {/* Delivery Icon */}
          <div className="flex justify-center my-4">
            <div className="relative h-12 w-12">
              <Image src="/images/delivery.gif" alt="Delivery" fill className="object-contain" />
            </div>
          </div>

          <Separator className="my-4" />

          {/* Order Summary */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Duration Charge</span>
              <span>GHC {reservationDetails?.durationPrice || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Guest Charge</span>
              <span>GHC {reservationDetails?.guestsPrice || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Fee</span>
              <span>GHC {fee.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">E - Levy</span>
              <span>GHC {levy.toFixed(1)}</span>
            </div>
          </div>

          <div className="text-center my-4">
            <p className="text-sm text-gray-600">You will be charged</p>
            <p className="text-xl font-bold">GHC {total}</p>
          </div>

          <Separator className="my-4" />

          {/* Payment Methods */}
          <div className="mt-6">
            <p className="text-sm text-gray-600 mb-2">Pay with</p>

            <RadioGroup value={paymentMethod || ""} onValueChange={setPaymentMethod} className="space-y-4">
              {/* MTN Mobile Money */}
              <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mtn_money" id="mtn_money" />
                  <Label htmlFor="mtn_money" className="font-medium">
                    MTN Mobile Money
                  </Label>
                </div>
                <div className="relative h-8 w-8">
                  <Image src="/images/payment/mtn.png" alt="MTN" fill className="object-contain" />
                </div>
              </div>

              {/* Telecel */}
              <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="telecel" id="telecel" />
                  <Label htmlFor="telecel" className="font-medium">
                    Telecel
                  </Label>
                </div>
                <div className="relative h-8 w-8">
                  <Image src="/images/payment/telecel.png" alt="Telecel" fill className="object-contain" />
                </div>
              </div>

              {/* AT */}
              <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="at" id="at" />
                  <Label htmlFor="at" className="font-medium">
                    AT
                  </Label>
                </div>
                <div className="relative h-8 w-8">
                  <Image src="/images/payment/at.jpg" alt="AT" fill className="object-contain" />
                </div>
              </div>

              <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="font-medium">
                    Cash
                  </Label>
                </div>
                <div className="relative h-8 w-8">
                  <Image src="/placeholder.svg?height=32&width=32" alt="Cash" fill className="object-contain" />
                </div>
              </div>
            </RadioGroup>
          </div>
        </div>
      </section>

      {/* Confirm Button */}
      <section className="relative z-10 px-4 py-6">
        <Button
          className="w-full bg-red-600 hover:bg-red-700 text-white py-6 rounded-full text-xl"
          disabled={!paymentMethod || isProcessing}
          onClick={handleConfirmBooking}
        >
          {isProcessing ? "Processing..." : "Confirm Booking"}
        </Button>
      </section>

      {/* Confirming Dialog */}
      {showConfirmingDialog && <ReservationConfirmingDialog />}

      {/* Confirmed Dialog */}
      {showConfirmedDialog && (
        <ReservationConfirmedDialog onContinue={handleReservationConfirmed} reservationId={reservationId || ""} />
      )}

      <BottomNav active="home" />
    </main>
  )
}


"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ChevronLeft, CreditCard, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { OrderProcessingDialog } from "@/components/order-processing-dialog"
import { OrderConfirmedDialog } from "@/components/order-confirmed-dialog"
import { useAuth } from "@/components/auth-provider"
import { saveOrder, awardPointsForNewItems, awardBirthdayPoints } from "@/lib/firestore-utils"
import { useToast } from "@/hooks/use-toast"

export default function PaymentPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [paymentMethod, setPaymentMethod] = useState("momo-mtn")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [checkoutData, setCheckoutData] = useState<any>(null)
  const [loyaltyPointsEarned, setLoyaltyPointsEarned] = useState(0)

  useEffect(() => {
    // Get checkout data from session storage
    const storedCheckoutData = sessionStorage.getItem("checkoutData")
    if (storedCheckoutData) {
      setCheckoutData(JSON.parse(storedCheckoutData))
    } else {
      // If no checkout data, redirect to cart
      router.push("/cart")
    }
  }, [router])

  const handlePayment = async () => {
    if (!checkoutData || !user) return

    setIsProcessing(true)

    try {
      // Prepare order data
      const orderData = {
        userId: user.uid,
        items: checkoutData.items,
        subtotal: checkoutData.subtotal,
        deliveryFee: checkoutData.deliveryFee || 0,
        totalAmount: checkoutData.total + (checkoutData.deliveryFee || 0),
        loyaltyPointsUsed: checkoutData.loyaltyPointsUsed || 0,
        status: "pending" as const,
        deliveryAddress: checkoutData.deliveryAddress,
        deliveryCoordinates: checkoutData.deliveryCoordinates,
        paymentMethod: paymentMethod,
        createdAt: new Date(),
      }

      // Save order to Firestore
      const newOrderId = await saveOrder(orderData)
      setOrderId(newOrderId)

      // Award loyalty points for new items
      const newItemPoints = await awardPointsForNewItems(user.uid, checkoutData.items)

      // Award birthday points if applicable
      const birthdayPoints = await awardBirthdayPoints(user.uid)

      // Set total points earned
      setLoyaltyPointsEarned(newItemPoints + birthdayPoints)

      // Clear checkout data from session storage
      sessionStorage.removeItem("checkoutData")

      // Show confirmation after a delay to simulate payment processing
      setTimeout(() => {
        setIsProcessing(false)
        setIsConfirmed(true)
      }, 3000)
    } catch (error) {
      console.error("Error processing payment:", error)
      setIsProcessing(false)
      alert("Payment failed. Please try again.")
    }
  }

  const handleConfirmation = () => {
    setIsConfirmed(false)
    router.push("/order-success")
  }

  if (!checkoutData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white p-4 shadow-sm flex items-center">
        <Button variant="outline" size="icon" className="mr-2 rounded-full" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Payment</h1>
      </header>

      <div className="flex-1 p-4">
        {/* Payment Methods */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Select Payment Method</h2>

          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
            <div
              className={`flex items-center border rounded-lg p-3 ${
                paymentMethod === "momo-mtn" ? "border-red-600 bg-red-50" : ""
              }`}
            >
              <RadioGroupItem value="momo-mtn" id="momo-mtn" className="mr-3" />
              <Label htmlFor="momo-mtn" className="flex-1 flex items-center cursor-pointer">
                <div className="relative h-10 w-10 mr-3">
                  <Image src="/images/payment/mtn.png" alt="MTN Mobile Money" fill className="object-contain" />
                </div>
                <span>MTN Mobile Money</span>
              </Label>
            </div>

            <div
              className={`flex items-center border rounded-lg p-3 ${
                paymentMethod === "momo-telecel" ? "border-red-600 bg-red-50" : ""
              }`}
            >
              <RadioGroupItem value="momo-telecel" id="momo-telecel" className="mr-3" />
              <Label htmlFor="momo-telecel" className="flex-1 flex items-center cursor-pointer">
                <div className="relative h-10 w-10 mr-3">
                  <Image src="/images/payment/telecel.png" alt="Telecel Mobile Money" fill className="object-contain" />
                </div>
                <span>Telecel Mobile Money</span>
              </Label>
            </div>

            <div
              className={`flex items-center border rounded-lg p-3 ${
                paymentMethod === "airtel-tigo" ? "border-red-600 bg-red-50" : ""
              }`}
            >
              <RadioGroupItem value="airtel-tigo" id="airtel-tigo" className="mr-3" />
              <Label htmlFor="airtel-tigo" className="flex-1 flex items-center cursor-pointer">
                <div className="relative h-10 w-10 mr-3">
                  <Image src="/images/payment/at.jpg" alt="AirtelTigo Money" fill className="object-contain" />
                </div>
                <span>AirtelTigo Money</span>
              </Label>
            </div>

            <div
              className={`flex items-center border rounded-lg p-3 ${
                paymentMethod === "card" ? "border-red-600 bg-red-50" : ""
              }`}
            >
              <RadioGroupItem value="card" id="card" className="mr-3" />
              <Label htmlFor="card" className="flex-1 flex items-center cursor-pointer">
                <div className="relative h-10 w-10 mr-3 flex items-center justify-center">
                  <CreditCard className="h-6 w-6" />
                </div>
                <span>Credit/Debit Card</span>
              </Label>
            </div>
          </RadioGroup>
        </section>

        {/* Phone Number Input (for Mobile Money) */}
        {paymentMethod.startsWith("momo") || paymentMethod === "airtel-tigo" ? (
          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Enter Phone Number</h2>
            <Input
              type="tel"
              placeholder="e.g. 024 123 4567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="py-6 px-4 rounded-xl"
            />
            <p className="text-sm text-gray-500 mt-2">
              You will receive a prompt on your phone to complete the payment.
            </p>
          </section>
        ) : null}

        {/* Order Summary */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>GHC {checkoutData.subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>GHC {(checkoutData.deliveryFee || 0).toFixed(2)}</span>
              </div>

              {checkoutData.loyaltyPointsUsed > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Loyalty Points</span>
                  <span>- GHC {checkoutData.loyaltyPointsUsed.toFixed(2)}</span>
                </div>
              )}

              <Separator className="my-2" />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>GHC {(checkoutData.total + (checkoutData.deliveryFee || 0)).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Delivery Address */}
        {checkoutData.deliveryAddress && (
          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Delivery Address</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p>{checkoutData.deliveryAddress}</p>
            </div>
          </section>
        )}
      </div>

      {/* Pay Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
        <Button
          className="w-full bg-red-600 hover:bg-red-700 text-white py-6 rounded-xl text-xl"
          onClick={handlePayment}
          disabled={
            isProcessing || (paymentMethod !== "card" && !phoneNumber) || (paymentMethod === "card" && false) // Add card validation later
          }
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay GHC ${(checkoutData.total + (checkoutData.deliveryFee || 0)).toFixed(2)}`
          )}
        </Button>
      </div>

      {/* Processing Dialog */}
      <OrderProcessingDialog isOpen={isProcessing} />

      {/* Confirmation Dialog */}
      <OrderConfirmedDialog
        isOpen={isConfirmed}
        onClose={handleConfirmation}
        orderId={orderId || ""}
        loyaltyPointsEarned={loyaltyPointsEarned}
      />
    </main>
  )
}


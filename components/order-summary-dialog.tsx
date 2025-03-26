"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface OrderSummaryDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  deliveryMethod: "delivery" | "pickup"
  deliveryAddress?: string
  additionalInfo?: string
}

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

export function OrderSummaryDialog({
  isOpen,
  onClose,
  onConfirm,
  deliveryMethod,
  deliveryAddress,
  additionalInfo,
}: OrderSummaryDialogProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [subtotal, setSubtotal] = useState(0)
  const [loyaltyPointsUsed, setLoyaltyPointsUsed] = useState(0)
  const [deliveryFee, setDeliveryFee] = useState(0)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    // Get checkout data from session storage
    const checkoutDataStr = sessionStorage.getItem("checkoutData")
    if (checkoutDataStr) {
      const checkoutData = JSON.parse(checkoutDataStr)
      setCartItems(checkoutData.items || [])
      setSubtotal(checkoutData.subtotal || 0)
      setLoyaltyPointsUsed(checkoutData.loyaltyPointsUsed || 0)

      // Set delivery fee based on delivery method
      const fee = deliveryMethod === "delivery" ? 20 : 0
      setDeliveryFee(fee)

      // Calculate total: subtotal - loyalty points + delivery fee
      const calculatedTotal = Math.max(0, checkoutData.subtotal - checkoutData.loyaltyPointsUsed) + fee
      setTotal(calculatedTotal)

      // Update the checkout data with delivery information and correct total
      const updatedCheckoutData = {
        ...checkoutData,
        deliveryMethod,
        deliveryAddress,
        additionalInfo,
        deliveryFee: fee,
        finalTotal: calculatedTotal,
      }
      sessionStorage.setItem("checkoutData", JSON.stringify(updatedCheckoutData))
    }
  }, [deliveryMethod, deliveryAddress, additionalInfo])

  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
    onClose() // Make sure to close the dialog after confirming
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Order Summary</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-4">
          {/* Delivery Method */}
          <div>
            <h3 className="font-semibold mb-2">Delivery Method</h3>
            <p className="text-gray-700 capitalize">{deliveryMethod}</p>
          </div>

          {/* Delivery Address */}
          {deliveryMethod === "delivery" && deliveryAddress && (
            <div>
              <h3 className="font-semibold mb-2">Delivery Address</h3>
              <p className="text-gray-700">{deliveryAddress}</p>
            </div>
          )}

          {/* Pickup Location */}
          {deliveryMethod === "pickup" && (
            <div>
              <h3 className="font-semibold mb-2">Pickup Location</h3>
              <p className="text-gray-700">EatMe Kitchen, Accra Mall</p>
            </div>
          )}

          {/* Additional Info */}
          {additionalInfo && (
            <div>
              <h3 className="font-semibold mb-2">Additional Information</h3>
              <p className="text-gray-700">{additionalInfo}</p>
            </div>
          )}

          {/* Order Items */}
          <div>
            <h3 className="font-semibold mb-2">Items</h3>
            <div className="space-y-2">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span className="text-gray-700">
                    {item.quantity} x {item.name}
                  </span>
                  <span className="font-medium">GHC {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Order Totals */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>GHC {subtotal.toFixed(2)}</span>
            </div>

            {loyaltyPointsUsed > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Loyalty Points</span>
                <span>- GHC {loyaltyPointsUsed.toFixed(2)}</span>
              </div>
            )}

            {deliveryMethod === "delivery" && (
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee</span>
                <span>GHC {deliveryFee.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between font-bold mt-2">
              <span>Total</span>
              <span>GHC {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <Button
          className="w-full bg-red-600 hover:bg-red-700 text-white py-6 rounded-full text-lg mt-6"
          onClick={handleConfirm}
        >
          Proceed to Payment
        </Button>
      </div>
    </div>
  )
}


"use client"

import { useEffect } from "react"
import Image from "next/image"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface OrderConfirmedDialogProps {
  isOpen: boolean
  onClose: () => void
  orderId: string
  loyaltyPointsEarned?: number
}

export function OrderConfirmedDialog({ isOpen, onClose, orderId, loyaltyPointsEarned = 0 }: OrderConfirmedDialogProps) {
  useEffect(() => {
    // Disable body scroll when dialog is open
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="p-6 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>

          <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
          <p className="text-gray-600 mb-4">Your order #{orderId.slice(-6)} has been confirmed.</p>

          <div className="relative h-40 w-full mb-4">
            <Image src="/images/order-confirmed.png" alt="Order Confirmed" fill className="object-contain" />
          </div>

          {loyaltyPointsEarned > 0 && (
            <div className="bg-orange-100 p-4 rounded-lg mb-4">
              <p className="text-orange-800 font-semibold">
                You earned {loyaltyPointsEarned} loyalty points with this order!
              </p>
            </div>
          )}

          <Button className="w-full bg-red-600 hover:bg-red-700 text-white py-6 rounded-full text-xl" onClick={onClose}>
            Track Order
          </Button>
        </div>
      </div>
    </div>
  )
}


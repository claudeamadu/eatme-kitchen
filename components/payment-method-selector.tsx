"use client"

import { useState } from "react"
import Image from "next/image"
import { Plus } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface PaymentMethodSelectorProps {
  onSelect: (method: string, wallet?: string) => void
}

export function PaymentMethodSelector({ onSelect }: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)

  // Saved wallets
  const savedWallets = [
    {
      id: "mtn_1",
      number: "0551245566",
      provider: "MTN Mobile Money",
      logo: "/images/payment/mtn.png",
    },
  ]

  const handleMethodChange = (value: string) => {
    setSelectedMethod(value)

    // If mobile money is selected and there's a saved wallet, use it
    if (value === "mobile_money" && savedWallets.length > 0) {
      onSelect(value, savedWallets[0].id)
    } else {
      onSelect(value)
    }
  }

  return (
    <div className="bg-white rounded-lg">
      <div className="p-4 border-b">
        <p className="text-gray-600">Pay with</p>
      </div>

      <RadioGroup value={selectedMethod || ""} onValueChange={handleMethodChange}>
        {/* Mobile Money */}
        <div className={`p-4 border-b ${selectedMethod === "mobile_money" ? "bg-red-50" : ""}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <RadioGroupItem value="mobile_money" id="mobile_money" className="mr-2" />
              <Label htmlFor="mobile_money">Mobile Money</Label>
            </div>
            <div className="flex space-x-1">
              <div className="relative h-8 w-8">
                <Image src="/images/payment/mtn.png" alt="MTN" fill className="object-contain" />
              </div>
              <div className="relative h-8 w-8">
                <Image src="/images/payment/telecel.png" alt="Telecel" fill className="object-contain" />
              </div>
              <div className="relative h-8 w-8">
                <Image src="/images/payment/at.jpg" alt="AT" fill className="object-contain" />
              </div>
            </div>
          </div>

          {selectedMethod === "mobile_money" && (
            <div className="mt-4 space-y-4">
              {savedWallets.map((wallet) => (
                <div key={wallet.id} className="p-3 border rounded-lg">
                  <p className="font-medium">{wallet.number}</p>
                  <p className="text-sm text-gray-500">{wallet.provider}</p>
                </div>
              ))}

              <button className="flex items-center text-red-600 font-medium">
                <Plus className="h-4 w-4 mr-1" />
                Add a new wallet
              </button>
            </div>
          )}
        </div>

        {/* Bank Card */}
        <div className={`p-4 border-b ${selectedMethod === "bank_card" ? "bg-red-50" : ""}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <RadioGroupItem value="bank_card" id="bank_card" className="mr-2" />
              <Label htmlFor="bank_card">Bank Card</Label>
            </div>
            <div className="relative h-8 w-12">
              <Image src="/placeholder.svg?height=32&width=48" alt="Mastercard" fill className="object-contain" />
            </div>
          </div>
        </div>

        {/* Cash */}
        <div className={`p-4 ${selectedMethod === "cash" ? "bg-red-50" : ""}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <RadioGroupItem value="cash" id="cash" className="mr-2" />
              <Label htmlFor="cash">Cash</Label>
            </div>
            <div className="relative h-8 w-8">
              <Image src="/placeholder.svg?height=32&width=32" alt="Cash" fill className="object-contain" />
            </div>
          </div>
        </div>
      </RadioGroup>
    </div>
  )
}


"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { ChevronLeft, Download, Share } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface ReceiptProps {
  params: {
    id: string
  }
}

export default function ReceiptPage({ params }: ReceiptProps) {
  const router = useRouter()
  const receiptId = params.id

  // Sample receipt data
  const receipt = {
    id: receiptId,
    orderNumber: "210043",
    date: "25 Jul 2024",
    time: "15:12",
    paymentMethod: "MTN Mobile Money",
    paymentAccount: "055 444 0123",
    items: [
      {
        name: "Assorted Jollof",
        description: "with extra Tilapia",
        quantity: 1,
        price: 100,
      },
      {
        name: "Assorted Noodles",
        quantity: 1,
        price: 100,
      },
    ],
    subtotal: 200,
    loyaltyDiscount: 20,
    deliveryFee: 10,
    total: 190,
    status: "Paid",
  }

  return (
    <main className="flex min-h-screen flex-col pb-16">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image src="/images/background.png" alt="Background pattern" fill className="object-cover" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-4 flex items-center justify-between bg-white bg-opacity-90">
        <div className="flex items-center">
          <Button variant="outline" size="icon" className="mr-2 rounded-full bg-white" onClick={() => router.back()}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Receipt</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" className="rounded-full">
            <Download className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full">
            <Share className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Receipt Content */}
      <section className="relative z-10 px-4 flex-1">
        <div className="bg-white rounded-lg p-6 shadow-md">
          {/* Receipt Header */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative h-16 w-16 mb-2">
              <Image src="/images/logo.png" alt="EatMe Kitchen Logo" fill className="object-contain" />
            </div>
            <h2 className="text-xl font-bold">EatMe Kitchen</h2>
            <p className="text-gray-500 text-sm">Receipt #{receipt.orderNumber}</p>
          </div>

          <Separator className="my-4" />

          {/* Order Details */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Date</span>
              <span>{receipt.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time</span>
              <span>{receipt.time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method</span>
              <span>{receipt.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Account</span>
              <span>{receipt.paymentAccount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status</span>
              <span className="text-green-600 font-semibold">{receipt.status}</span>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Order Items */}
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Items</h3>
            {receipt.items.map((item, index) => (
              <div key={index} className="mb-3">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">
                      {item.name} <span className="text-gray-500">x{item.quantity}</span>
                    </p>
                    {item.description && <p className="text-sm text-gray-500">{item.description}</p>}
                  </div>
                  <p className="font-medium">GHC {item.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          {/* Order Summary */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>GHC {receipt.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Loyalty Discount</span>
              <span className="text-red-600">- GHC {receipt.loyaltyDiscount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Fee</span>
              <span>GHC {receipt.deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg mt-2">
              <span>Total</span>
              <span>GHC {receipt.total.toFixed(2)}</span>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Footer */}
          <div className="text-center text-gray-500 text-sm">
            <p>Thank you for your order!</p>
            <p className="mt-1">For any inquiries, please contact us at support@eatmekitchen.com</p>
          </div>
        </div>
      </section>
    </main>
  )
}


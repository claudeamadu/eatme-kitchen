"use client"

import { useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function OrderSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    // Auto-navigate to home after 5 seconds
    const timer = setTimeout(() => {
      router.push("/home")
    }, 5000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <main className="flex min-h-screen flex-col">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image src="/images/background.png" alt="Background pattern" fill className="object-cover" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center">
        <CheckCircle className="h-24 w-24 text-green-500 mb-6" />

        <h1 className="text-2xl font-bold mb-2">Order Successful!</h1>
        <p className="text-gray-600 mb-8">Your order has been placed successfully.</p>

        <div className="relative h-32 w-32 mb-8">
          <Image src="/images/delivery.gif" alt="Delivery" fill className="object-contain" />
        </div>

        <p className="text-gray-600 mb-2">Your food is being prepared</p>
        <p className="text-gray-600 mb-8">Estimated delivery time: 30-45 minutes</p>

        <Button
          className="bg-red-600 hover:bg-red-700 w-full py-6 rounded-xl text-xl"
          onClick={() => router.push("/orders")}
        >
          Track Order
        </Button>

        <Button variant="outline" className="mt-4 w-full" onClick={() => router.push("/home")}>
          Back to Home
        </Button>
      </div>
    </main>
  )
}


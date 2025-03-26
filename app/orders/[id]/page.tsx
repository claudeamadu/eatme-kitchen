"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ChevronLeft, MapPin, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { getOrder, type Order } from "@/lib/firestore-utils"
import { Skeleton } from "@/components/ui/skeleton"

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch order details from Firestore
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true)
        const orderData = await getOrder(params.id)
        setOrder(orderData)
      } catch (error) {
        console.error("Error fetching order details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [params.id])

  // Format date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A"

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "processing":
        return "bg-blue-500"
      case "delivered":
        return "bg-green-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  if (!loading && !order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>Order not found</p>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col pb-6">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white p-4 shadow-sm flex items-center">
        <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Order Details</h1>
      </header>

      {/* Order Details */}
      <div className="flex-1 p-4">
        {loading ? (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-4" />

              <Separator className="my-4" />

              <Skeleton className="h-5 w-32 mb-3" />
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-16 w-16 rounded-md" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2 mb-2" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <Skeleton className="h-5 w-32 mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <Skeleton className="h-5 w-32 mb-3" />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold">Order #{order?.id.slice(-6)}</h2>
                <Badge className={`${getStatusColor(order?.status || "pending")} text-white`}>
                  {order?.status.charAt(0).toUpperCase() + order?.status.slice(1)}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mb-1">Placed on {formatDate(order?.createdAt)}</p>
              <p className="text-sm text-gray-500">
                {order?.items.length} {order?.items.length === 1 ? "item" : "items"}
              </p>

              <Separator className="my-4" />

              <h3 className="font-medium mb-3">Items</h3>
              <div className="space-y-4">
                {order?.items.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="relative h-16 w-16 flex-shrink-0">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-xs text-gray-500">
                        Size: {item.size.charAt(0).toUpperCase() + item.size.slice(1)}
                        {item.extras.length > 0 && `, Extras: ${item.extras.length}`}
                      </p>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm">x{item.quantity}</span>
                        <span className="font-medium">GHC {item.totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-medium mb-3">Delivery Information</h3>
              <div className="flex items-start gap-2 mb-2">
                <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{order?.deliveryAddress || "No delivery address provided"}</p>
              </div>
              <div className="flex items-start gap-2">
                <CreditCard className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm">Paid with {order?.paymentMethod || "Unknown payment method"}</p>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-medium mb-3">Payment Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>GHC {(order?.totalAmount - 10).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery Fee</span>
                  <span>GHC 10.00</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>GHC {order?.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => router.push("/settings/help")}>
                Need Help?
              </Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={() => router.push("/menu")}>
                Reorder
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}


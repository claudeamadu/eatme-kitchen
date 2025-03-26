"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ChevronRight, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/bottom-nav"
import { getOrders, type Order } from "@/lib/firestore-utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch orders from Firestore
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        // Using a placeholder user ID - in a real app, get this from auth
        const userId = "user123"
        const fetchedOrders = await getOrders(userId)
        setOrders(fetchedOrders)
      } catch (error) {
        console.error("Error fetching orders:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

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

  return (
    <main className="flex min-h-screen flex-col pb-16">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white p-4 shadow-sm">
        <h1 className="text-xl font-bold">My Orders</h1>
      </header>

      {/* Orders List */}
      <div className="flex-1 p-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="h-3 w-full mb-2" />
                <div className="flex justify-between items-center mt-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-6 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <Package className="h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">Browse our menu and place your first order</p>
            <Button onClick={() => router.push("/menu")} className="bg-red-600 hover:bg-red-700">
              Browse Menu
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white p-4 rounded-lg shadow-sm cursor-pointer"
                onClick={() => router.push(`/orders/${order.id}`)}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">Order #{order.id.slice(-6)}</span>
                  <Badge className={`${getStatusColor(order.status)} text-white`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm mb-2">
                  {order.items.length} {order.items.length === 1 ? "item" : "items"} • GHC{" "}
                  {order.totalAmount.toFixed(2)}
                </p>
                <div className="flex -space-x-2 mb-2">
                  {order.items.slice(0, 3).map((item, index) => (
                    <div key={index} className="relative h-8 w-8 rounded-full border-2 border-white overflow-hidden">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="relative h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium border-2 border-white">
                      +{order.items.length - 3}
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">{formatDate(order.createdAt)}</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav active="orders" />
    </main>
  )
}


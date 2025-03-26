"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { ChevronLeft, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/bottom-nav"

// Notification types
type NotificationType = "order_confirmed" | "payment_complete" | "menu_update" | "order_cancelled" | "payment_failed"

interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  time: string
  date?: string
  actionLink?: string
  actionText?: string
}

export default function NotificationsPage() {
  const router = useRouter()

  // Group notifications by date
  const today: Notification[] = [
    {
      id: "1",
      type: "order_confirmed",
      title: "Order confirmed",
      message:
        "The restaurant has received your order and is processing it now. You will be notified once order is ready.",
      time: "3:12PM",
    },
    {
      id: "2",
      type: "payment_complete",
      title: "Payment complete",
      message: "Your payment of GHC250 for your order has been processed successfully.",
      time: "3:12PM",
      actionLink: "/receipt/250",
      actionText: "View receipt",
    },
  ]

  const yesterday: Notification[] = [
    {
      id: "3",
      type: "menu_update",
      title: "Menu update",
      message: "Discover our new blend of recipes for a mouth watering dish.",
      time: "10:45AM",
    },
  ]

  const older: Notification[] = [
    {
      id: "4",
      type: "order_cancelled",
      title: "Order cancelled",
      message: "We could not process your order due to incomplete payment. Kindly check your payment methods.",
      time: "1:30PM",
      date: "21/11/2024",
    },
    {
      id: "5",
      type: "payment_failed",
      title: "Failed Transaction",
      message: "Your payment of GHC150 failed due to not enough funds. Please load your account and try again.",
      time: "1:00PM",
      date: "21/11/2024",
    },
  ]

  // Function to get notification icon based on type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "order_confirmed":
      case "order_cancelled":
        return <Bell className="h-5 w-5 text-white" />
      case "payment_complete":
      case "payment_failed":
        return <span className="text-white text-lg">₵</span>
      case "menu_update":
        return <span className="text-white text-lg">🍽️</span>
      default:
        return <Bell className="h-5 w-5 text-white" />
    }
  }

  // Function to get notification background color based on type
  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case "order_confirmed":
        return "bg-red-600"
      case "payment_complete":
        return "bg-gray-500"
      case "menu_update":
        return "bg-gray-500"
      case "order_cancelled":
        return "bg-gray-500"
      case "payment_failed":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleActionClick = (link: string) => {
    router.push(link)
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
        <h1 className="text-xl font-bold">Notifications</h1>
      </header>

      {/* Notifications List */}
      <section className="relative z-10 px-4 flex-1">
        {/* Today */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Today</h2>
          <div className="space-y-4">
            {today.map((notification) => (
              <div key={notification.id} className="bg-white p-4 rounded-lg">
                <div className="flex">
                  <div
                    className={`h-10 w-10 rounded-full ${getNotificationColor(notification.type)} flex items-center justify-center mr-3 flex-shrink-0`}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold">{notification.title}</h3>
                      <span className="text-sm text-gray-500">{notification.time}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    {notification.actionText && (
                      <button
                        onClick={() => notification.actionLink && handleActionClick(notification.actionLink)}
                        className="text-sm text-orange-500 mt-1 inline-block"
                      >
                        {notification.actionText}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Yesterday */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Yesterday</h2>
          <div className="space-y-4">
            {yesterday.map((notification) => (
              <div key={notification.id} className="bg-white p-4 rounded-lg">
                <div className="flex">
                  <div
                    className={`h-10 w-10 rounded-full ${getNotificationColor(notification.type)} flex items-center justify-center mr-3 flex-shrink-0`}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold">{notification.title}</h3>
                      <span className="text-sm text-gray-500">{notification.time}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    {notification.actionText && (
                      <button
                        onClick={() => notification.actionLink && handleActionClick(notification.actionLink)}
                        className="text-sm text-orange-500 mt-1 inline-block"
                      >
                        {notification.actionText}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Older */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-500 mb-2">21/11/2024</h2>
          <div className="space-y-4">
            {older.map((notification) => (
              <div key={notification.id} className="bg-white p-4 rounded-lg">
                <div className="flex">
                  <div
                    className={`h-10 w-10 rounded-full ${getNotificationColor(notification.type)} flex items-center justify-center mr-3 flex-shrink-0`}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold">{notification.title}</h3>
                      <span className="text-sm text-gray-500">{notification.time}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    {notification.actionText && (
                      <button
                        onClick={() => notification.actionLink && handleActionClick(notification.actionLink)}
                        className="text-sm text-orange-500 mt-1 inline-block"
                      >
                        {notification.actionText}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BottomNav active="home" />
    </main>
  )
}


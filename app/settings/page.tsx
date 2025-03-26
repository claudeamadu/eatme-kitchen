"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, CreditCard, Gift, HelpCircle, Info, Pencil, Calendar } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { useAuth } from "@/components/auth-provider"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

// Settings menu items
const settingsItems = [
  {
    id: "payment",
    name: "Payment Methods",
    icon: <CreditCard className="h-5 w-5" />,
    href: "/settings/payment-methods",
  },
  {
    id: "reservations",
    name: "My Reservations",
    icon: <Calendar className="h-5 w-5" />,
    href: "/reservations",
  },
  {
    id: "loyalty",
    name: "Loyalty Rewards",
    icon: <Gift className="h-5 w-5" />,
    href: "/settings/loyalty",
  },
  {
    id: "help",
    name: "Help Center",
    icon: <HelpCircle className="h-5 w-5" />,
    href: "/settings/help",
  },
  {
    id: "about",
    name: "About",
    icon: <Info className="h-5 w-5" />,
    href: "/settings/about",
  },
]

export default function SettingsPage() {
  const { user } = useAuth()
  const [userData, setUserData] = useState({
    displayName: "",
    phoneNumber: "",
    photoURL: "/images/profile/avatar.jpg",
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return

      try {
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid))

        if (userDoc.exists()) {
          const data = userDoc.data()
          setUserData({
            displayName: data.displayName || user.displayName || "User",
            phoneNumber: data.phoneNumber || user.phoneNumber || "",
            photoURL: data.photoURL || user.photoURL || "/images/profile/avatar.jpg",
          })
        } else {
          // Use Firebase Auth data if no Firestore data
          setUserData({
            displayName: user.displayName || "User",
            phoneNumber: user.phoneNumber || "",
            photoURL: user.photoURL || "/images/profile/avatar.jpg",
          })
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [user])

  return (
    <main className="flex min-h-screen flex-col pb-16">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image src="/images/background.png" alt="Background pattern" fill className="object-cover" />
      </div>

      {/* Profile Section */}
      <section className="relative z-10 p-4">
        <Link href="/profile">
          <div className="bg-white rounded-lg p-4 flex items-center shadow-md hover:bg-gray-50 transition-colors">
            <div className="relative h-12 w-12 mr-3">
              <Image
                src={userData.photoURL || "/placeholder.svg"}
                alt="Profile"
                fill
                className="object-cover rounded-full"
                onError={(e) => {
                  // Fallback if image fails to load
                  const target = e.target as HTMLImageElement
                  target.src = "/images/profile/avatar.jpg"
                }}
              />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-lg">{isLoading ? "Loading..." : userData.displayName}</h2>
              <p className="text-sm text-gray-500">{isLoading ? "..." : userData.phoneNumber || "No phone number"}</p>
            </div>
            <button className="text-red-600">
              <Pencil className="h-5 w-5" />
            </button>
          </div>
        </Link>
      </section>

      {/* Settings Menu */}
      <section className="relative z-10 px-4 mt-4">
        <div className="space-y-4">
          {settingsItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="flex items-center justify-between bg-white p-4 rounded-lg shadow-md"
            >
              <div className="flex items-center">
                <span className="mr-3 text-gray-600">{item.icon}</span>
                <span>{item.name}</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </Link>
          ))}
        </div>
      </section>

      <BottomNav active="settings" />
    </main>
  )
}


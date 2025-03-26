"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronLeft, Gift, Users, Utensils, Cake, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BottomNav } from "@/components/bottom-nav"
import { AlertDialog } from "@/components/alert-dialog"

export default function LoyaltyRewardsPage() {
  const router = useRouter()
  const [points, setPoints] = useState(1000)
  const [showRedeemDialog, setShowRedeemDialog] = useState(false)

  const loyaltyPrograms = [
    {
      id: "referral",
      title: "Referral Feast",
      description: "Refer 10 friends and gain a whooping 1000pts",
      icon: <Users className="h-6 w-6 text-orange-500" />,
      progress: 1,
      total: 10,
      image: "/images/loyalty/referral-team.png",
    },
    {
      id: "first_bite",
      title: "First Bite Bonus",
      description: "Enjoy extra points when you try a new menu item.",
      icon: <Utensils className="h-6 w-6 text-orange-500" />,
      count: "6 New trys",
      image: "/images/loyalty/first-bite.png",
    },
    {
      id: "loyalty_lunch",
      title: "Loyalty Lunch",
      description: "Unlock a free lunch after several visits.",
      icon: <Gift className="h-6 w-6 text-orange-500" />,
      image: "/images/loyalty/lunch-meal.png",
    },
    {
      id: "birthday",
      title: "Birthday Bash",
      description: "Celebrate your birthday with bonus points and exclusive perks.",
      icon: <Cake className="h-6 w-6 text-orange-500" />,
      image: "/images/loyalty/birthday.png",
    },
    {
      id: "feedback",
      title: "Feedback Star",
      description: "Get rewarded for leaving 8 reviews.",
      icon: <MessageSquare className="h-6 w-6 text-orange-500" />,
      progress: 1,
      total: 8,
      image: "/images/feedback-stars.png",
    },
  ]

  const handleRedeem = () => {
    setShowRedeemDialog(true)
  }

  const confirmRedeem = () => {
    setShowRedeemDialog(false)
    // In a real app, this would handle point redemption
    setPoints(points - 100) // Deduct points for the redemption
  }

  return (
    <main className="flex min-h-screen flex-col pb-16">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <Image src="/images/background.png" alt="Background pattern" fill className="object-cover" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-4 flex items-center bg-white bg-opacity-90">
        <Button variant="outline" size="icon" className="mr-2 rounded-full bg-white" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Loyalty Rewards</h1>
      </header>

      {/* Points Card */}
      <section className="relative z-10 px-4 mt-4">
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-lg font-semibold mb-2">Points</h2>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-5xl font-bold text-red-600">{points.toLocaleString()}</p>
              <p className="text-sm text-gray-500">5% off your next meal order</p>
            </div>
            <div className="flex items-center">
              <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleRedeem}>
                Redeem
              </Button>
              <div className="relative h-24 w-24 ml-4">
                <Image src="/images/loyalty/gift-box.png" alt="Loyalty Rewards" fill className="object-contain" />
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-700 mt-4">Earn more points and enjoy exclusive benefits</p>
        </div>
      </section>

      {/* Loyalty Programs */}
      <section className="relative z-10 px-4 mt-6">
        <div className="grid grid-cols-2 gap-4">
          {loyaltyPrograms.map((program) => (
            <div key={program.id} className="bg-white rounded-lg p-4 shadow-md">
              <div className="relative h-24 w-full mb-4">
                <Image
                  src={program.image || "/placeholder.svg?height=96&width=150"}
                  alt={program.title}
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="font-bold text-center">{program.title}</h3>
              <p className="text-xs text-gray-500 text-center">{program.description}</p>

              {program.progress && program.total && (
                <div className="mt-2">
                  <Progress value={(program.progress / program.total) * 100} className="h-2" />
                  <p className="text-xs text-right mt-1 text-red-600">
                    {program.progress}/{program.total}
                  </p>
                </div>
              )}

              {program.count && <p className="text-center text-sm text-red-600 mt-2">{program.count}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* Redeem Dialog */}
      <AlertDialog
        isOpen={showRedeemDialog}
        title="Redeem Points"
        message="Would you like to redeem 100 points for a 5% discount on your next order?"
        confirmText="Redeem"
        cancelText="Cancel"
        onConfirm={confirmRedeem}
        onCancel={() => setShowRedeemDialog(false)}
      />

      <BottomNav active="settings" />
    </main>
  )
}


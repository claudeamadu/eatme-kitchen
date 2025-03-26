"use client"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BottomNav } from "@/components/bottom-nav"

export default function PaymentMethodsPage() {
  const router = useRouter()

  // Saved cards/payment methods
  const savedCards = [
    {
      id: 1,
      type: "mobile_money",
      provider: "mtn",
      number: "055 444 0123",
      name: "Sylvia",
      logo: "/images/payment/mtn.png",
    },
  ]

  // Payment options
  const paymentOptions = [
    {
      id: "card",
      name: "Credit / Debit Card",
      icon: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "telecel_at",
      name: "Telecel / AT",
      icons: ["/images/payment/telecel.png", "/images/payment/at.jpg"],
    },
  ]

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
        <h1 className="text-xl font-bold">Saved cards</h1>
      </header>

      {/* Saved Cards */}
      <section className="relative z-10 px-4 mt-4">
        <div className="space-y-4">
          {savedCards.map((card) => (
            <Card key={card.id} className="p-4 rounded-lg bg-gray-500 text-white">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-6">
                    <div className="h-10 w-10 bg-yellow-400 rounded-md flex items-center justify-center mr-2">
                      <div className="h-6 w-6 bg-yellow-600 rounded-sm"></div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-xl font-mono">{card.number}</h3>
                  </div>

                  <div className="flex justify-between items-center">
                    <p>{card.name}</p>
                    <div className="h-8 w-8 relative">
                      <Image
                        src={card.logo || "/placeholder.svg"}
                        alt={card.provider}
                        fill
                        className="object-contain bg-white rounded-full p-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          <Button
            variant="outline"
            className="w-full py-6 flex items-center justify-center text-orange-500 border-dashed border-2 border-orange-500"
            onClick={() => {}}
          >
            <Plus className="mr-2 h-5 w-5" />
            Add new
          </Button>
        </div>
      </section>

      {/* More Payment Options */}
      <section className="relative z-10 px-4 mt-8">
        <h2 className="text-xl font-bold mb-4">More payment options</h2>

        <div className="space-y-4">
          {paymentOptions.map((option) => (
            <Card key={option.id} className="p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{option.name}</span>

                <div className="flex items-center">
                  {option.icons ? (
                    <div className="flex -space-x-2 mr-2">
                      {option.icons.map((icon, index) => (
                        <div key={index} className="h-8 w-8 relative">
                          <Image
                            src={icon || "/placeholder.svg"}
                            alt={`${option.name} ${index}`}
                            fill
                            className="object-contain rounded-full"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-8 w-8 relative mr-2">
                      <Image
                        src={option.icon || "/placeholder.svg"}
                        alt={option.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}

                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <BottomNav active="settings" />
    </main>
  )
}


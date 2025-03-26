"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BottomNav } from "@/components/bottom-nav"
import { auth, db } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"

interface PaymentMethod {
  id: string
  type: string
  provider: string
  number: string
  name: string
  logo: string
  isDefault: boolean
}

export default function PaymentMethodsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState<PaymentMethod | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])

  // Fetch payment methods from Firestore
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const user = auth.currentUser
        if (!user) {
          toast({
            title: "Authentication Required",
            description: "Please log in to view your payment methods",
            variant: "destructive",
          })
          router.push("/auth/login")
          return
        }

        // Get user's payment methods
        const paymentMethodsRef = collection(db, "users", user.uid, "paymentMethods")
        const paymentMethodsSnapshot = await getDocs(paymentMethodsRef)

        const methods: PaymentMethod[] = []
        let defaultMethod: PaymentMethod | null = null

        paymentMethodsSnapshot.forEach((doc) => {
          const data = doc.data() as Omit<PaymentMethod, "id">
          const method = {
            id: doc.id,
            ...data,
            logo: getProviderLogo(data.provider),
          }

          methods.push(method)

          if (data.isDefault) {
            defaultMethod = method
          }
        })

        setPaymentMethods(methods)
        setDefaultPaymentMethod(defaultMethod)
      } catch (error) {
        console.error("Error fetching payment methods:", error)
        toast({
          title: "Error",
          description: "Failed to load payment methods",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentMethods()
  }, [router, toast])

  // Helper function to get provider logo
  const getProviderLogo = (provider: string): string => {
    switch (provider.toLowerCase()) {
      case "mtn":
        return "/images/payment/mtn.png"
      case "telecel":
        return "/images/payment/telecel.png"
      case "at":
        return "/images/payment/at.jpg"
      default:
        return "/placeholder.svg?height=40&width=40"
    }
  }

  const handleAddPayment = () => {
    router.push("/settings/payment-methods/add-payment")
  }

  const handleEditPayment = (id: string) => {
    router.push(`/settings/payment-methods/add-payment?id=${id}`)
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
        <h1 className="text-xl font-bold">Saved cards</h1>
      </header>

      {loading ? (
        <div className="relative z-10 flex items-center justify-center flex-1">
          <Loader2 className="h-8 w-8 animate-spin text-red-600" />
        </div>
      ) : (
        <>
          {/* Default Payment Method */}
          <section className="relative z-10 px-4 mt-4">
            {defaultPaymentMethod ? (
              <Card
                key={defaultPaymentMethod.id}
                className="p-4 rounded-lg bg-gray-500 text-white cursor-pointer"
                onClick={() => handleEditPayment(defaultPaymentMethod.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-6">
                      <div className="h-10 w-10 bg-yellow-400 rounded-md flex items-center justify-center mr-2">
                        <div className="h-6 w-6 bg-yellow-600 rounded-sm"></div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h3 className="text-xl font-mono">{defaultPaymentMethod.number}</h3>
                    </div>

                    <div className="flex justify-between items-center">
                      <p>{defaultPaymentMethod.name}</p>
                      <div className="h-8 w-8 relative">
                        <Image
                          src={defaultPaymentMethod.logo || "/placeholder.svg"}
                          alt={defaultPaymentMethod.provider}
                          fill
                          className="object-contain bg-white rounded-full p-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <p className="text-gray-500 text-center py-4">No default payment method set</p>
            )}

            <Button
              variant="outline"
              className="w-full py-6 mt-4 flex items-center justify-center text-orange-500 border-dashed border-2 border-orange-500"
              onClick={handleAddPayment}
            >
              <Plus className="mr-2 h-5 w-5" />
              Add new
            </Button>
          </section>

          {/* All Payment Methods */}
          <section className="relative z-10 px-4 mt-8">
            <h2 className="text-xl font-bold mb-4">Mobile Money Options</h2>

            <div className="space-y-4">
              {paymentMethods.length > 0 ? (
                paymentMethods.map((method) => (
                  <Card
                    key={method.id}
                    className="p-4 rounded-lg cursor-pointer"
                    onClick={() => handleEditPayment(method.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-gray-600">{method.provider}</span>
                        <p className="text-sm text-gray-500">{method.number}</p>
                      </div>

                      <div className="flex items-center">
                        <div className="h-8 w-8 relative mr-2">
                          <Image
                            src={method.logo || "/placeholder.svg"}
                            alt={method.provider}
                            fill
                            className="object-contain rounded-full"
                          />
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No payment methods added yet</p>
              )}
            </div>
          </section>
        </>
      )}

      <BottomNav active="settings" />
    </main>
  )
}


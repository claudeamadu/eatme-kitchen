"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { BottomNav } from "@/components/bottom-nav"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc, setDoc, updateDoc, collection, getDocs } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

export default function AddPaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentId = searchParams.get("id")
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(!!paymentId)
  const [accountNumber, setAccountNumber] = useState("")
  const [accountName, setAccountName] = useState("")
  const [provider, setProvider] = useState<string>("mtn")
  const [isDefault, setIsDefault] = useState(false)
  const [saving, setSaving] = useState(false)

  // Fetch payment method if editing
  useEffect(() => {
    const fetchPaymentMethod = async () => {
      if (!paymentId) {
        setInitialLoading(false)
        return
      }

      try {
        const user = auth.currentUser
        if (!user) {
          toast({
            title: "Authentication Required",
            description: "Please log in to edit payment methods",
            variant: "destructive",
          })
          router.push("/auth/login")
          return
        }

        const paymentMethodRef = doc(db, "users", user.uid, "paymentMethods", paymentId)
        const paymentMethodSnap = await getDoc(paymentMethodRef)

        if (paymentMethodSnap.exists()) {
          const data = paymentMethodSnap.data()
          setAccountNumber(data.number || "")
          setAccountName(data.name || "")
          setProvider(data.provider || "mtn")
          setIsDefault(data.isDefault || false)
        } else {
          toast({
            title: "Error",
            description: "Payment method not found",
            variant: "destructive",
          })
          router.push("/settings/payment-methods")
        }
      } catch (error) {
        console.error("Error fetching payment method:", error)
        toast({
          title: "Error",
          description: "Failed to load payment method details",
          variant: "destructive",
        })
      } finally {
        setInitialLoading(false)
      }
    }

    fetchPaymentMethod()
  }, [paymentId, router, toast])

  const handleSave = async () => {
    try {
      setSaving(true)
      const user = auth.currentUser
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to save payment methods",
          variant: "destructive",
        })
        router.push("/auth/login")
        return
      }

      // If setting as default, update all other payment methods to not be default
      if (isDefault) {
        const paymentMethodsRef = collection(db, "users", user.uid, "paymentMethods")
        const paymentMethodsSnapshot = await getDocs(paymentMethodsRef)

        const updatePromises = paymentMethodsSnapshot.docs.map((doc) => {
          return updateDoc(doc.ref, { isDefault: false })
        })

        await Promise.all(updatePromises)
      }

      // Prepare payment method data
      const paymentMethodData = {
        type: "mobile_money",
        provider,
        number: accountNumber,
        name: accountName,
        isDefault,
        updatedAt: new Date().toISOString(),
      }

      // Save or update payment method
      if (paymentId) {
        // Update existing payment method
        const paymentMethodRef = doc(db, "users", user.uid, "paymentMethods", paymentId)
        await updateDoc(paymentMethodRef, paymentMethodData)
        toast({
          title: "Success",
          description: "Payment method updated successfully",
        })
      } else {
        // Create new payment method
        const paymentMethodsRef = collection(db, "users", user.uid, "paymentMethods")
        await setDoc(doc(paymentMethodsRef), {
          ...paymentMethodData,
          createdAt: new Date().toISOString(),
        })
        toast({
          title: "Success",
          description: "Payment method added successfully",
        })
      }

      router.push("/settings/payment-methods")
    } catch (error) {
      console.error("Error saving payment method:", error)
      toast({
        title: "Error",
        description: "Failed to save payment method",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (initialLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
        <p className="mt-2 text-gray-600">Loading payment details...</p>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col pb-16">
      {/* Background */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-red-100 to-white"></div>

      {/* Header */}
      <header className="relative z-10 p-4 flex items-center bg-white bg-opacity-90">
        <Button variant="outline" size="icon" className="mr-2 rounded-full bg-white" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">{paymentId ? "Edit Payment" : "Add Payment"}</h1>
      </header>

      {/* Card Preview */}
      <section className="relative z-10 px-4 mt-4">
        <div className="bg-gray-500 rounded-lg p-6 text-white">
          <div className="flex items-center mb-6">
            <div className="h-10 w-10 bg-yellow-400 rounded-md flex items-center justify-center">
              <div className="h-6 w-6 bg-yellow-600 rounded-sm"></div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-mono">{accountNumber || "XXX XXX XXXX"}</h3>
          </div>

          <div>
            <p>{accountName || "Account Name"}</p>
          </div>
        </div>
      </section>

      {/* Payment Form */}
      <section className="relative z-10 px-4 mt-8">
        <div className="space-y-6">
          <div>
            <Label htmlFor="provider">Provider</Label>
            <RadioGroup value={provider} onValueChange={setProvider} className="grid grid-cols-3 gap-4 mt-2">
              <div
                className={`border rounded-lg p-3 text-center ${provider === "mtn" ? "border-red-600 bg-red-50" : ""}`}
              >
                <RadioGroupItem value="mtn" id="mtn" className="sr-only" />
                <Label htmlFor="mtn" className="cursor-pointer flex flex-col items-center">
                  <div className="h-8 w-8 relative mb-2">
                    <Image src="/images/payment/mtn.png" alt="MTN" fill className="object-contain" />
                  </div>
                  <span>MTN</span>
                </Label>
              </div>

              <div
                className={`border rounded-lg p-3 text-center ${provider === "telecel" ? "border-red-600 bg-red-50" : ""}`}
              >
                <RadioGroupItem value="telecel" id="telecel" className="sr-only" />
                <Label htmlFor="telecel" className="cursor-pointer flex flex-col items-center">
                  <div className="h-8 w-8 relative mb-2">
                    <Image src="/images/payment/telecel.png" alt="Telecel" fill className="object-contain" />
                  </div>
                  <span>Telecel</span>
                </Label>
              </div>

              <div
                className={`border rounded-lg p-3 text-center ${provider === "at" ? "border-red-600 bg-red-50" : ""}`}
              >
                <RadioGroupItem value="at" id="at" className="sr-only" />
                <Label htmlFor="at" className="cursor-pointer flex flex-col items-center">
                  <div className="h-8 w-8 relative mb-2">
                    <Image src="/images/payment/at.jpg" alt="AT" fill className="object-contain" />
                  </div>
                  <span>AT</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="py-6 px-4 rounded-xl mt-2"
              placeholder="e.g., 055 123 4567"
            />
          </div>

          <div>
            <Label htmlFor="accountName">Account Name</Label>
            <Input
              id="accountName"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="py-6 px-4 rounded-xl mt-2"
              placeholder="Enter account name"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isDefault"
              checked={isDefault}
              onCheckedChange={(checked) => setIsDefault(checked === true)}
            />
            <Label htmlFor="isDefault" className="cursor-pointer">
              Set as default payment method
            </Label>
          </div>
        </div>
      </section>

      {/* Save Button */}
      <section className="relative z-10 px-4 mt-auto py-6">
        <Button
          className="w-full bg-red-600 hover:bg-red-700 text-white py-6 rounded-full text-xl"
          onClick={handleSave}
          disabled={!accountNumber || !accountName || !provider || saving}
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save"
          )}
        </Button>
      </section>

      <BottomNav active="settings" />
    </main>
  )
}


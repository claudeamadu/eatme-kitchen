"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { BottomNav } from "@/components/bottom-nav"
import { AlertDialog } from "@/components/alert-dialog"

export default function RefundsPage() {
  const router = useRouter()
  const [orderNumber, setOrderNumber] = useState("")
  const [reason, setReason] = useState("")
  const [refundType, setRefundType] = useState<string>("full")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  const handleSubmit = () => {
    if (!orderNumber || !reason || !refundType) return

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setShowSuccessDialog(true)
    }, 1500)
  }

  const handleDialogConfirm = () => {
    setShowSuccessDialog(false)
    router.push("/settings/help")
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
        <h1 className="text-xl font-bold">Refunds & Cancellations</h1>
      </header>

      {/* Refund Form */}
      <section className="relative z-10 px-4 mt-4 flex-1">
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-bold mb-2">Request a Refund</h2>
          <p className="text-gray-500 mb-6">
            Please provide the details of your order and the reason for requesting a refund.
          </p>

          <div className="space-y-6">
            <div>
              <Label htmlFor="orderNumber">Order Number</Label>
              <Input
                id="orderNumber"
                placeholder="e.g., 210043"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="py-6 px-4 rounded-xl mt-2"
              />
            </div>

            <div>
              <Label htmlFor="refundType">Refund Type</Label>
              <RadioGroup value={refundType} onValueChange={setRefundType} className="mt-2 space-y-2">
                <div className="flex items-center space-x-2 border p-3 rounded-lg">
                  <RadioGroupItem value="full" id="full" />
                  <Label htmlFor="full">Full Refund</Label>
                </div>
                <div className="flex items-center space-x-2 border p-3 rounded-lg">
                  <RadioGroupItem value="partial" id="partial" />
                  <Label htmlFor="partial">Partial Refund</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="reason">Reason for Refund</Label>
              <Textarea
                id="reason"
                placeholder="Please explain why you're requesting a refund"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-[150px] rounded-xl p-4 mt-2"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Submit Button */}
      <section className="relative z-10 px-4 py-6">
        <Button
          className="w-full bg-red-600 hover:bg-red-700 text-white py-6 rounded-full text-xl shadow-md"
          onClick={handleSubmit}
          disabled={!orderNumber || !reason || isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Refund Request"}
        </Button>
      </section>

      {/* Success Dialog */}
      <AlertDialog
        isOpen={showSuccessDialog}
        title="Request Submitted"
        message="Your refund request has been submitted successfully. We'll review your request and process it within 3-5 business days."
        confirmText="OK"
        cancelText=""
        onConfirm={handleDialogConfirm}
        onCancel={() => {}}
      />

      <BottomNav active="settings" />
    </main>
  )
}


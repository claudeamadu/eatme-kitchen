"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { BottomNav } from "@/components/bottom-nav"
import { AlertDialog } from "@/components/alert-dialog"

export default function ReservationAssistancePage() {
  const router = useRouter()
  const [subject, setSubject] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  const handleSubmit = () => {
    if (!subject || !description) return

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
        <h1 className="text-xl font-bold">Reservation Assistance</h1>
      </header>

      {/* Assistance Form */}
      <section className="relative z-10 px-4 mt-4 flex-1">
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-bold mb-2">Need help with your reservation?</h2>
          <p className="text-gray-500 mb-6">
            Let us know what issues you're experiencing with your table reservation, and our team will assist you
            promptly.
          </p>

          <div className="space-y-6">
            <div>
              <Input
                placeholder="Subject (e.g., 'Need to modify my reservation')"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="py-6 px-4 rounded-xl"
              />
            </div>

            <div>
              <Textarea
                placeholder="Please provide details about your reservation issue, including date, time, and any specific requests."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[200px] rounded-xl p-4"
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
          disabled={!subject || !description || isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </Button>
      </section>

      {/* Success Dialog */}
      <AlertDialog
        isOpen={showSuccessDialog}
        title="Request Submitted"
        message="Your reservation assistance request has been submitted successfully. Our team will contact you shortly."
        confirmText="OK"
        cancelText=""
        onConfirm={handleDialogConfirm}
        onCancel={() => {}}
      />

      <BottomNav active="settings" />
    </main>
  )
}


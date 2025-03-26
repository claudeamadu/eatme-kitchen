"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronLeft, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { BottomNav } from "@/components/bottom-nav"
import { AlertDialog } from "@/components/alert-dialog"

export default function FeedbackPage() {
  const router = useRouter()
  const [rating, setRating] = useState<number>(0)
  const [feedback, setFeedback] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  const handleSubmit = () => {
    if (rating === 0 || !feedback) return

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
        <Image src="/images/background.png" alt="Background pattern" fill className="object-cover" sizes="100vw" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-4 flex items-center bg-white bg-opacity-90">
        <Button variant="outline" size="icon" className="mr-2 rounded-full bg-white" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Feedback</h1>
      </header>

      {/* Feedback Image */}
      <section className="relative z-10 px-4 mt-4 flex justify-center">
        <div className="w-64 h-64 relative">
          <Image
            src="/images/feedback-stars.png"
            alt="Feedback and ratings"
            fill
            className="object-contain"
            sizes="256px"
          />
        </div>
      </section>

      {/* Feedback Form */}
      <section className="relative z-10 px-4 mt-2 flex-1">
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-bold mb-2">Share Your Feedback</h2>
          <p className="text-gray-500 mb-6">We value your opinion! Let us know how we can improve your experience.</p>

          <div className="space-y-6">
            <div>
              <p className="font-medium mb-2">How would you rate your overall experience?</p>
              <div className="flex justify-center space-x-2 my-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setRating(star)} className="focus:outline-none">
                    <Star
                      className={`h-10 w-10 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-gray-500">
                {rating > 0 ? `You rated us ${rating} out of 5 stars` : "Select a rating"}
              </p>
            </div>

            <div>
              <p className="font-medium mb-2">Tell us more about your experience</p>
              <Textarea
                placeholder="What did you like? What could we improve?"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="min-h-[150px] rounded-xl p-4"
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
          disabled={rating === 0 || !feedback || isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Feedback"}
        </Button>
      </section>

      {/* Success Dialog */}
      <AlertDialog
        isOpen={showSuccessDialog}
        title="Thank You!"
        message="Your feedback has been submitted successfully. We appreciate your input and will use it to improve our services."
        confirmText="OK"
        cancelText=""
        onConfirm={handleDialogConfirm}
        onCancel={() => {}}
      />

      <BottomNav active="settings" />
    </main>
  )
}


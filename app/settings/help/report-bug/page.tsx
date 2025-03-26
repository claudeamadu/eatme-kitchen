"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { BottomNav } from "@/components/bottom-nav"

export default function ReportBugPage() {
  const router = useRouter()
  const [subject, setSubject] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = () => {
    if (!subject || !description) return

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      router.push("/settings/help")
    }, 1500)
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
        <h1 className="text-xl font-bold">Help Center</h1>
      </header>

      {/* Bug Report Form */}
      <section className="relative z-10 px-4 mt-4 flex-1">
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-2">Report a bug</h2>
          <p className="text-gray-500 mb-6">Let us know any technical issue you're facing.</p>

          <div className="space-y-6">
            <div>
              <Input
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="py-6 px-4 rounded-xl"
              />
            </div>

            <div>
              <Textarea
                placeholder="Describe the bug experienced as detailed as you can."
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
          className="w-full bg-red-600 hover:bg-red-700 text-white py-6 rounded-full text-xl"
          onClick={handleSubmit}
          disabled={!subject || !description || isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Report"}
        </Button>
      </section>

      <BottomNav active="settings" />
    </main>
  )
}


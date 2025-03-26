"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { BottomNav } from "@/components/bottom-nav"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"

export default function EditReservationPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const { id } = params
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    duration: "",
    guests: "",
    occasion: "",
    specialRequests: "",
  })

  // Fetch reservation data
  useEffect(() => {
    const fetchReservation = async () => {
      setIsLoading(true)
      try {
        const user = auth.currentUser
        if (!user) {
          toast({
            title: "Authentication Required",
            description: "Please log in to edit your reservation",
            variant: "destructive",
          })
          router.push("/auth/login")
          return
        }

        const reservationRef = doc(db, "reservations", id)
        const reservationSnap = await getDoc(reservationRef)

        if (reservationSnap.exists()) {
          const data = reservationSnap.data()

          // Check if this reservation belongs to the current user
          if (data.userId !== user.uid) {
            toast({
              title: "Access Denied",
              description: "You don't have permission to edit this reservation",
              variant: "destructive",
            })
            router.push("/reservations")
            return
          }

          // Format date and time for the form
          const dateMatch = data.date?.match(/(\d+)\s+(\w+),\s+(\d+)/)
          const timeMatch = data.time?.match(/(\d+):(\d+)\s+(\w+)/)

          let formattedDate = ""
          if (dateMatch) {
            const [_, day, month, year] = dateMatch
            // Convert to YYYY-MM-DD format
            const monthNum = new Date(`${month} 1, 2000`).getMonth() + 1
            formattedDate = `${year}-${monthNum.toString().padStart(2, "0")}-${day.padStart(2, "0")}`
          }

          let formattedTime = ""
          if (timeMatch) {
            const [_, hour, minute, period] = timeMatch
            // Convert to 24-hour format for the time input
            let hourNum = Number.parseInt(hour)
            if (period.toUpperCase() === "PM" && hourNum < 12) hourNum += 12
            if (period.toUpperCase() === "AM" && hourNum === 12) hourNum = 0
            formattedTime = `${hourNum.toString().padStart(2, "0")}:${minute}`
          }

          // Extract duration number from string like "3hrs"
          const durationMatch = data.duration?.match(/(\d+)/)
          const durationValue = durationMatch ? durationMatch[1] : "3"

          // Extract guests range from string like "9-15 guests"
          const guestsValue = data.guests?.replace(" guests", "")

          setFormData({
            date: formattedDate,
            time: formattedTime,
            duration: durationValue,
            guests: guestsValue,
            occasion: data.occasion || "",
            specialRequests: data.specialInstructions || "",
          })
        } else {
          toast({
            title: "Reservation Not Found",
            description: "The reservation you're trying to edit doesn't exist",
            variant: "destructive",
          })
          router.push("/reservations")
        }
      } catch (error) {
        console.error("Error fetching reservation:", error)
        toast({
          title: "Error",
          description: "Failed to load reservation details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchReservation()
  }, [id, router, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const user = auth.currentUser
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to save changes",
          variant: "destructive",
        })
        router.push("/auth/login")
        return
      }

      // Format date for storage
      const dateObj = new Date(formData.date)
      const formattedDate = `${dateObj.getDate()} ${dateObj.toLocaleString("default", { month: "long" })}, ${dateObj.getFullYear()}`

      // Format time for storage
      const [hours, minutes] = formData.time.split(":")
      let hour = Number.parseInt(hours)
      const period = hour >= 12 ? "PM" : "AM"
      if (hour > 12) hour -= 12
      if (hour === 0) hour = 12
      const formattedTime = `${hour}:${minutes} ${period}`

      // Format duration and guests
      const formattedDuration = `${formData.duration}hrs`
      const formattedGuests = `${formData.guests} guests`

      // Update the reservation in Firestore
      const reservationRef = doc(db, "reservations", id)
      await updateDoc(reservationRef, {
        date: formattedDate,
        time: formattedTime,
        duration: formattedDuration,
        guests: formattedGuests,
        occasion: formData.occasion,
        specialInstructions: formData.specialRequests,
        updatedAt: new Date(),
      })

      toast({
        title: "Success",
        description: "Reservation updated successfully",
      })

      // Navigate back to the reservation details page
      router.push(`/reservations/${id}`)
    } catch (error) {
      console.error("Error updating reservation:", error)
      toast({
        title: "Error",
        description: "Failed to update reservation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="text-center">
          <p>Loading reservation details...</p>
        </div>
      </main>
    )
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
        <h1 className="text-xl font-bold">Modify Reservation</h1>
      </header>

      {/* Edit Form */}
      <section className="relative z-10 px-4 mt-2 flex-1">
        <Card className="p-5 rounded-lg">
          <div className="space-y-5">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Date</label>
              <Input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="py-6 px-4 rounded-xl bg-white"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">Time</label>
              <Input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="py-6 px-4 rounded-xl bg-white"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">Duration</label>
              <Select value={formData.duration} onValueChange={(value) => handleSelectChange("duration", value)}>
                <SelectTrigger className="py-6 px-4 rounded-xl bg-white">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hour</SelectItem>
                  <SelectItem value="2">2 hours</SelectItem>
                  <SelectItem value="3">3 hours</SelectItem>
                  <SelectItem value="4">4 hours</SelectItem>
                  <SelectItem value="5">5 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">Party Size</label>
              <Select value={formData.guests} onValueChange={(value) => handleSelectChange("guests", value)}>
                <SelectTrigger className="py-6 px-4 rounded-xl bg-white">
                  <SelectValue placeholder="Select party size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2-4">2-4 guests</SelectItem>
                  <SelectItem value="5-8">5-8 guests</SelectItem>
                  <SelectItem value="9-15">9-15 guests</SelectItem>
                  <SelectItem value="16+">16+ guests</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">Occasion (Optional)</label>
              <Select value={formData.occasion} onValueChange={(value) => handleSelectChange("occasion", value)}>
                <SelectTrigger className="py-6 px-4 rounded-xl bg-white">
                  <SelectValue placeholder="Select occasion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="Birthday">Birthday</SelectItem>
                  <SelectItem value="Anniversary">Anniversary</SelectItem>
                  <SelectItem value="Business Meeting">Business Meeting</SelectItem>
                  <SelectItem value="Date Night">Date Night</SelectItem>
                  <SelectItem value="Family Gathering">Family Gathering</SelectItem>
                  <SelectItem value="Celebration">Celebration</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">Special Requests (Optional)</label>
              <Textarea
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleChange}
                className="py-3 px-4 rounded-xl bg-white min-h-[100px]"
                placeholder="Any special requests or notes"
              />
            </div>
          </div>

          <div className="mt-6">
            <Button
              className="w-full bg-red-600 hover:bg-red-700 text-white py-6 rounded-full text-xl"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </Card>
      </section>

      <BottomNav active="home" />
    </main>
  )
}


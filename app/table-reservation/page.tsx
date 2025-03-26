"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronLeft, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { BottomNav } from "@/components/bottom-nav"
import { auth } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format, addDays } from "date-fns"

export default function TableReservationPage() {
  const router = useRouter()
  const { toast } = useToast()

  // Date state - set default to tomorrow to avoid validation issues
  const tomorrow = addDays(new Date(), 1)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(tomorrow)
  const [date, setDate] = useState({
    day: tomorrow.getDate().toString(),
    month: format(tomorrow, "MMMM"),
    year: tomorrow.getFullYear().toString(),
  })

  // Time state
  const [hour, setHour] = useState("10")
  const [minute, setMinute] = useState("00")
  const [period, setPeriod] = useState("AM")

  const [duration, setDuration] = useState("3hrs")
  const [guests, setGuests] = useState("9-15 guests")
  const [occasion, setOccasion] = useState("")
  const [specialInstructions, setSpecialInstructions] = useState("")
  const [charCount, setCharCount] = useState(0)

  // Update date object when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      const newDate = {
        day: selectedDate.getDate().toString(),
        month: format(selectedDate, "MMMM"),
        year: selectedDate.getFullYear().toString(),
      }
      setDate(newDate)
    }
  }, [selectedDate])

  // Check if user is logged in
  useEffect(() => {
    const user = auth.currentUser
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to make a reservation",
        variant: "destructive",
      })
      router.push("/auth/login")
    }
  }, [router, toast])

  const handleDurationSelect = (value: string) => {
    setDuration(value)
  }

  const handleGuestsSelect = (value: string) => {
    setGuests(value)
  }

  const handleSpecialInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setSpecialInstructions(text)
    setCharCount(text.length)
  }

  // Calculate price based on duration and guests
  const calculatePrice = () => {
    let durationPrice = 0
    let guestsPrice = 0

    // Calculate duration price
    if (duration === "1hr") durationPrice = 50
    else if (duration === "2hrs") durationPrice = 100
    else if (duration === "3hrs") durationPrice = 150
    else if (duration === "4hrs") durationPrice = 200
    else if (duration === "5hrs") durationPrice = 250
    else if (duration === "All Day") durationPrice = 500

    // Calculate guests price
    if (guests === "2-4 guests") guestsPrice = 100
    else if (guests === "5-8 guests") guestsPrice = 250
    else if (guests === "9-15 guests") guestsPrice = 500
    else if (guests === "16+ guests") guestsPrice = 750

    return {
      durationPrice,
      guestsPrice,
      totalPrice: durationPrice + guestsPrice,
    }
  }

  // Update the handleReserveTable function to navigate to the details page
  const handleReserveTable = () => {
    if (!selectedDate) {
      toast({
        title: "Date Required",
        description: "Please select a reservation date",
        variant: "destructive",
      })
      return
    }

    if (!occasion) {
      toast({
        title: "Occasion Required",
        description: "Please select an occasion for your reservation",
        variant: "destructive",
      })
      return
    }

    // Calculate prices
    const { durationPrice, guestsPrice, totalPrice } = calculatePrice()

    // Store reservation details in session storage
    const reservationDetails = {
      date: `${date.day} ${date.month}, ${date.year}`,
      time: `${hour}:${minute} ${period}`,
      duration,
      guests,
      occasion,
      specialInstructions,
      durationPrice,
      guestsPrice,
      totalPrice,
    }

    sessionStorage.setItem("reservationDetails", JSON.stringify(reservationDetails))
    router.push("/table-reservation/details")
  }

  // Generate hour options (1-12)
  const hourOptions = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(1, "0"))

  // Generate minute options (00, 15, 30, 45)
  const minuteOptions = ["00", "15", "30", "45"]

  // Occasion options
  const occasionOptions = [
    "Birthday",
    "Anniversary",
    "Business Meeting",
    "Date Night",
    "Family Gathering",
    "Celebration",
    "Other",
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
        <h1 className="text-xl font-bold">Table Reservation</h1>
      </header>

      {/* Reservation Form */}
      <section className="relative z-10 px-4 flex-1">
        <p className="text-gray-600 mb-6">
          Please provide your reservation details, including date, time, party size, and any special requests, to help
          us prepare for your arrival and ensure a seamless experience.
        </p>

        {/* Date Selection */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-2">Select date</p>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between bg-white py-6 cursor-pointer" type="button">
                {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select date"}
                <Calendar className="h-4 w-4 ml-2" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date)
                  // Explicitly update the date state when a date is selected
                  if (date) {
                    setDate({
                      day: date.getDate().toString(),
                      month: format(date, "MMMM"),
                      year: date.getFullYear().toString(),
                    })
                  }
                }}
                initialFocus
                disabled={(date) => date < new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Time Selection */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-2">Select time</p>
          <div className="flex gap-2">
            <Select value={hour} onValueChange={setHour}>
              <SelectTrigger className="flex-1 bg-white">
                <SelectValue placeholder="Hour" />
              </SelectTrigger>
              <SelectContent>
                {hourOptions.map((h) => (
                  <SelectItem key={h} value={h}>
                    {h}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={minute} onValueChange={setMinute}>
              <SelectTrigger className="flex-1 bg-white">
                <SelectValue placeholder="Minute" />
              </SelectTrigger>
              <SelectContent>
                {minuteOptions.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="flex-1 bg-white">
                <SelectValue placeholder="AM/PM" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AM">AM</SelectItem>
                <SelectItem value="PM">PM</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Duration Selection */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-2">Reservation duration</p>
          <div className="flex flex-wrap gap-2">
            {["1hr", "2hrs", "3hrs", "4hrs", "5hrs", "All Day"].map((option) => (
              <Button
                key={option}
                variant={duration === option ? "default" : "outline"}
                className={`rounded-md ${duration === option ? "bg-red-600 hover:bg-red-700" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                onClick={() => handleDurationSelect(option)}
              >
                {option}
              </Button>
            ))}
          </div>
          <p className="text-xs text-orange-500 mt-2">Note: A charge of GHC50 per hour applies to your reservation.</p>
        </div>

        {/* Number of Guests */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-2">Number of guests</p>
          <div className="flex flex-wrap gap-2">
            {["2-4 guests", "5-8 guests", "9-15 guests", "16+ guests"].map((option) => (
              <Button
                key={option}
                variant={guests === option ? "default" : "outline"}
                className={`rounded-md ${guests === option ? "bg-red-600 hover:bg-red-700" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                onClick={() => handleGuestsSelect(option)}
              >
                {option}
              </Button>
            ))}
          </div>
          <p className="text-xs text-orange-500 mt-2">Note: A charge of GHC500 applies to your selection.</p>
        </div>

        {/* Occasion */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-2">Occasion</p>
          <Select value={occasion} onValueChange={setOccasion}>
            <SelectTrigger className="w-full bg-white py-6">
              <SelectValue placeholder="Select an occasion" />
            </SelectTrigger>
            <SelectContent>
              {occasionOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Special Instructions */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-2">Special instructions (optional)</p>
          <Textarea
            placeholder="Add any special requests (e.g., dietary needs, seating preferences, or accessibility requirements)."
            className="min-h-[100px] bg-white"
            value={specialInstructions}
            onChange={handleSpecialInstructionsChange}
            maxLength={100}
          />
          <div className="text-right text-xs text-gray-500 mt-1">{charCount}/100</div>
        </div>
      </section>

      {/* Reserve Button */}
      <section className="relative z-10 px-4 py-6">
        <Button
          className="w-full bg-red-600 hover:bg-red-700 text-white py-6 rounded-full text-xl"
          onClick={handleReserveTable}
        >
          Reserve Table
        </Button>
      </section>

      <BottomNav active="home" />
    </main>
  )
}


"use client"
import { useState, useEffect } from "react"
import type React from "react"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronLeft, Calendar, Clock, Users, MoreVertical, Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BottomNav } from "@/components/bottom-nav"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { auth, db } from "@/lib/firebase"
import { collection, query, where, getDocs, doc, updateDoc, orderBy } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"

// Reservation status types
type ReservationStatus = "Upcoming" | "Completed" | "Cancelled"

// Reservation item interface
interface ReservationItem {
  id: string
  reservationNumber: string
  status: ReservationStatus
  date: string
  time: string
  duration: string
  guests: string
  occasion?: string
  createdAt?: any
}

export default function ReservationsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<string | null>(null)
  const [reservations, setReservations] = useState<ReservationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isCancelling, setIsCancelling] = useState(false)

  // Fetch reservations from Firestore
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const user = auth.currentUser
        if (!user) {
          setLoading(false)
          return
        }

        const reservationsRef = collection(db, "reservations")
        const q = query(reservationsRef, where("userId", "==", user.uid), orderBy("createdAt", "desc"))

        const querySnapshot = await getDocs(q)
        const reservationsList: ReservationItem[] = []

        querySnapshot.forEach((doc) => {
          const data = doc.data()
          reservationsList.push({
            id: doc.id,
            reservationNumber: data.reservationNumber || "",
            status: data.status || "Upcoming",
            date: data.date || "",
            time: data.time || "",
            duration: data.duration || "",
            guests: data.guests || "",
            occasion: data.occasion || "",
            createdAt: data.createdAt,
          })
        })

        setReservations(reservationsList)
      } catch (error) {
        console.error("Error fetching reservations:", error)
        toast({
          title: "Error",
          description: "Failed to load reservations. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchReservations()
  }, [toast])

  // Function to get status color
  const getStatusColor = (status: ReservationStatus) => {
    switch (status) {
      case "Upcoming":
        return "text-orange-500"
      case "Completed":
        return "text-green-500"
      case "Cancelled":
        return "text-red-500"
      default:
        return ""
    }
  }

  const handleNewReservation = () => {
    router.push("/table-reservation")
  }

  const handleViewDetails = (id: string) => {
    // Navigate to the reservation details page
    router.push(`/reservations/${id}`)
  }

  const handleModify = (id: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the card click
    // Navigate to the edit page with the reservation ID
    router.push(`/table-reservation/edit/${id}`)
  }

  const handleCancelClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the card click
    setSelectedReservation(id)
    setShowCancelDialog(true)
  }

  const handleConfirmCancel = async () => {
    if (!selectedReservation) return

    setIsCancelling(true)

    try {
      // Update the reservation status in Firestore
      const reservationRef = doc(db, "reservations", selectedReservation)
      await updateDoc(reservationRef, {
        status: "Cancelled",
        updatedAt: new Date(),
      })

      // Update the local state
      setReservations((prevReservations) =>
        prevReservations.map((reservation) =>
          reservation.id === selectedReservation ? { ...reservation, status: "Cancelled" } : reservation,
        ),
      )

      toast({
        title: "Reservation Cancelled",
        description: "Your reservation has been successfully cancelled.",
      })
    } catch (error) {
      console.error("Error cancelling reservation:", error)
      toast({
        title: "Error",
        description: "Failed to cancel reservation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setShowCancelDialog(false)
      setSelectedReservation(null)
      setIsCancelling(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col pb-16">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image src="/images/background.png" alt="Background pattern" fill className="object-cover" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-4 flex items-center justify-between bg-white bg-opacity-90">
        <div className="flex items-center">
          <Button variant="outline" size="icon" className="mr-2 rounded-full bg-white" onClick={() => router.back()}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">My Reservations</h1>
        </div>
        {/* Mobile-friendly button */}
        <Button className="bg-red-600 hover:bg-red-700 sm:flex items-center" onClick={handleNewReservation} size="sm">
          <Plus className="h-4 w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">New Reservation</span>
          <span className="sm:hidden">New</span>
        </Button>
      </header>

      {/* Reservations List */}
      <section className="relative z-10 px-4 mt-2 flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full py-10">
            <Loader2 className="h-10 w-10 text-red-600 animate-spin mb-4" />
            <p className="text-gray-500">Loading your reservations...</p>
          </div>
        ) : reservations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-10 text-center">
            <div className="bg-gray-100 rounded-full p-6 mb-4">
              <Calendar className="h-10 w-10 text-red-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">No Reservations Yet</h3>
            <p className="text-gray-500 mb-6 max-w-xs">
              You haven't made any table reservations yet. Book a table to enjoy our delicious meals.
            </p>
            <Button className="bg-red-600 hover:bg-red-700" onClick={handleNewReservation}>
              Make a Reservation
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <Card
                key={reservation.id}
                className="p-4 rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleViewDetails(reservation.id)}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Reservation No. {reservation.reservationNumber}</span>
                    <span className={`text-sm font-medium ${getStatusColor(reservation.status)}`}>
                      {reservation.status}
                    </span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-2 mt-4">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                    <span>{reservation.date}</span>
                  </div>

                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-500 mr-2" />
                    <span>
                      {reservation.time} ({reservation.duration})
                    </span>
                  </div>

                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-gray-500 mr-2" />
                    <span>{reservation.guests}</span>
                  </div>

                  {reservation.occasion && (
                    <Badge className="bg-red-100 text-red-600 hover:bg-red-200">{reservation.occasion}</Badge>
                  )}
                </div>

                {reservation.status === "Upcoming" && (
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 border-red-600 text-red-600"
                      onClick={(e) => handleCancelClick(reservation.id, e)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      onClick={(e) => handleModify(reservation.id, e)}
                    >
                      Modify
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Reservation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this reservation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Keep Reservation</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isCancelling}
            >
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Yes, Cancel"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav active="home" />
    </main>
  )
}


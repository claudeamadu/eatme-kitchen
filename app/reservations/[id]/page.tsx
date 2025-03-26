"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter, useParams } from "next/navigation"
import { ChevronLeft, Calendar, Users, MapPin, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { BottomNav } from "@/components/bottom-nav"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
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

export default function ReservationDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [reservation, setReservation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const user = auth.currentUser
        if (!user) {
          router.push("/auth/login")
          return
        }

        const reservationId = params.id as string
        const reservationRef = doc(db, "reservations", reservationId)
        const reservationSnap = await getDoc(reservationRef)

        if (reservationSnap.exists()) {
          const data = reservationSnap.data()

          // Check if this reservation belongs to the current user
          if (data.userId !== user.uid) {
            toast({
              title: "Access Denied",
              description: "You don't have permission to view this reservation",
              variant: "destructive",
            })
            router.push("/reservations")
            return
          }

          setReservation({ id: reservationSnap.id, ...data })
        } else {
          toast({
            title: "Not Found",
            description: "Reservation not found",
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
        setLoading(false)
      }
    }

    fetchReservation()
  }, [params.id, router, toast])

  const handleModify = () => {
    router.push(`/table-reservation/edit/${params.id}`)
  }

  const handleCancelClick = () => {
    setShowCancelDialog(true)
  }

  const handleConfirmCancel = async () => {
    if (!reservation) return

    setIsCancelling(true)

    try {
      // Update the reservation status in Firestore
      const reservationRef = doc(db, "reservations", reservation.id)
      await updateDoc(reservationRef, {
        status: "Cancelled",
        updatedAt: new Date(),
      })

      // Update the local state
      setReservation({
        ...reservation,
        status: "Cancelled",
      })

      toast({
        title: "Reservation Cancelled",
        description: "Your reservation has been successfully cancelled.",
      })

      setShowCancelDialog(false)
    } catch (error) {
      console.error("Error cancelling reservation:", error)
      toast({
        title: "Error",
        description: "Failed to cancel reservation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCancelling(false)
    }
  }

  // Function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Upcoming":
        return "bg-orange-100 text-orange-600 hover:bg-orange-200"
      case "Completed":
        return "bg-green-100 text-green-600 hover:bg-green-200"
      case "Cancelled":
        return "bg-red-100 text-red-600 hover:bg-red-200"
      default:
        return "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-gray-200 mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 w-32 bg-gray-200 rounded"></div>
        </div>
      </main>
    )
  }

  if (!reservation) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Reservation Not Found</h1>
        <p className="text-gray-500 mb-6">
          The reservation you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Button className="bg-red-600 hover:bg-red-700" onClick={() => router.push("/reservations")}>
          Back to Reservations
        </Button>
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
      <header className="relative z-10 p-4 flex items-center justify-between bg-white bg-opacity-90">
        <div className="flex items-center">
          <Button variant="outline" size="icon" className="mr-2 rounded-full bg-white" onClick={() => router.back()}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Reservation Details</h1>
        </div>
        <Badge className={getStatusColor(reservation.status)}>{reservation.status}</Badge>
      </header>

      {/* Reservation Details */}
      <section className="relative z-10 px-4 flex-1">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Reservation #{reservation.reservationNumber}</h2>
          </div>

          <Separator className="my-4" />

          <div className="space-y-6">
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium">Date & Time</h3>
                <p className="text-gray-600">
                  {reservation.date} at {reservation.time}
                </p>
                <p className="text-gray-500 text-sm">Duration: {reservation.duration}</p>
              </div>
            </div>

            <div className="flex items-start">
              <Users className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium">Party Details</h3>
                <p className="text-gray-600">{reservation.guests}</p>
                {reservation.occasion && <p className="text-gray-500 text-sm">Occasion: {reservation.occasion}</p>}
              </div>
            </div>

            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium">Restaurant Location</h3>
                <p className="text-gray-600">EatMe Kitchen Main Branch</p>
                <p className="text-gray-500 text-sm">123 Food Street, Accra, Ghana</p>
              </div>
            </div>

            {reservation.specialInstructions && (
              <div className="bg-gray-50 p-3 rounded-md">
                <h3 className="font-medium mb-1">Special Instructions</h3>
                <p className="text-gray-600 text-sm">{reservation.specialInstructions}</p>
              </div>
            )}
          </div>

          <Separator className="my-6" />

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Duration Charge</span>
              <span>GHC {reservation.durationPrice || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Guest Charge</span>
              <span>GHC {reservation.guestsPrice || 0}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total Amount</span>
              <span>GHC {reservation.total || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Payment Method</span>
              <span className="text-gray-600">
                {reservation.paymentMethod?.replace("_", " ").toUpperCase() || "Cash"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {reservation.status === "Upcoming" && (
          <div className="mt-6 space-y-3">
            <Button className="w-full bg-red-600 hover:bg-red-700 py-5" onClick={handleModify}>
              Modify Reservation
            </Button>
            <Button variant="outline" className="w-full border-red-600 text-red-600 py-5" onClick={handleCancelClick}>
              Cancel Reservation
            </Button>
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
              {isCancelling ? "Cancelling..." : "Yes, Cancel"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav active="home" />
    </main>
  )
}


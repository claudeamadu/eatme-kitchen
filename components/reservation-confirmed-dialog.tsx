"use client"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

interface ReservationConfirmedDialogProps {
  onContinue: () => void
  reservationId?: string
}

export function ReservationConfirmedDialog({ onContinue, reservationId }: ReservationConfirmedDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="text-center p-6 max-w-md">
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-24 w-24 text-green-500" />
        </div>

        <h2 className="text-2xl font-bold mb-4">Reservation Confirmed!</h2>
        <p className="text-gray-500 mb-2">
          Your table reservation has been confirmed. We look forward to serving you on{" "}
          <span className="font-semibold">24 October, 2024 at 10:00 AM</span>.
        </p>

        {reservationId && <p className="text-sm text-gray-400 mb-8">Reservation ID: {reservationId}</p>}

        <Button
          className="w-full bg-red-600 hover:bg-red-700 text-white py-6 rounded-full text-xl"
          onClick={onContinue}
        >
          View My Reservations
        </Button>
      </div>
    </div>
  )
}


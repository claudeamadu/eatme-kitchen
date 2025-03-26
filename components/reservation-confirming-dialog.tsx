"use client"

import { Loader2 } from "lucide-react"

export function ReservationConfirmingDialog() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90">
      <div className="text-center p-6 max-w-md">
        <div className="flex justify-center mb-8">
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
            <Loader2 className="h-10 w-10 text-red-600 animate-spin" />
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4">Confirming your reservation</h2>
        <p className="text-gray-500">Please wait while we confirm your reservations.</p>
      </div>
    </div>
  )
}


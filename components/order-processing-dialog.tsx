"use client"

import { Loader2 } from "lucide-react"

interface OrderProcessingDialogProps {
  title: string
  message: string
}

export function OrderProcessingDialog({ title, message }: OrderProcessingDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="text-center p-6 max-w-md">
        <div className="flex justify-center mb-8">
          <Loader2 className="h-16 w-16 text-red-400 animate-spin" />
        </div>

        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-gray-500">{message}</p>
      </div>
    </div>
  )
}


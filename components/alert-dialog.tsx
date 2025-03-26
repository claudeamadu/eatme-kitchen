"use client"

import { Button } from "@/components/ui/button"

interface AlertDialogProps {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  isOpen: boolean
}

export function AlertDialog({
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isOpen,
}: AlertDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 p-6 shadow-lg">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-2xl font-bold mb-4">{title}</h2>
          <p className="text-gray-500 mb-8">{message}</p>

          <div className="flex w-full gap-4">
            <Button variant="outline" className="flex-1 py-6 rounded-full border-gray-300" onClick={onCancel}>
              {cancelText}
            </Button>
            <Button className="flex-1 py-6 rounded-full bg-red-600 hover:bg-red-700" onClick={onConfirm}>
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}


"use client"

import { Button } from "@/components/ui/button"

interface LogoutDialogProps {
  onClose: () => void
  onConfirm: () => void
}

export function LogoutDialog({ onClose, onConfirm }: LogoutDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 p-6">
        <div className="flex flex-col items-center text-center">
          <div className="bg-red-600 rounded-full p-4 mb-4">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold mb-4">Logout</h2>

          <p className="text-gray-500 mb-8">This action will log you out of the app. Do you wish to proceed?</p>

          <div className="flex w-full gap-4">
            <Button variant="outline" className="flex-1 py-6 rounded-full border-gray-300" onClick={onClose}>
              Cancel
            </Button>

            <Button className="flex-1 py-6 rounded-full bg-red-600 hover:bg-red-700" onClick={onConfirm}>
              Proceed
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}


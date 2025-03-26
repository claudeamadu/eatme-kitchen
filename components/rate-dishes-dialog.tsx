"use client"

import { useState } from "react"
import Image from "next/image"
import { Star, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { awardPointsForReview } from "@/lib/firestore-utils"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"

interface DishItem {
  id: string
  name: string
  image: string
}

interface RateDishesDialogProps {
  dishes: DishItem[]
  onClose: () => void
  onSubmit: (ratings: Record<string, { rating: number; comment: string }>) => void
}

export function RateDishesDialog({ dishes, onClose, onSubmit }: RateDishesDialogProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [ratings, setRatings] = useState<Record<string, { rating: number; comment: string }>>(
    dishes.reduce(
      (acc, dish) => {
        acc[dish.id] = { rating: 0, comment: "" }
        return acc
      },
      {} as Record<string, { rating: number; comment: string }>,
    ),
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pointsEarned, setPointsEarned] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleRatingChange = (dishId: string, rating: number) => {
    setRatings({
      ...ratings,
      [dishId]: { ...ratings[dishId], rating },
    })
  }

  const handleCommentChange = (dishId: string, comment: string) => {
    setRatings({
      ...ratings,
      [dishId]: { ...ratings[dishId], comment },
    })
  }

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit reviews",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    let totalPointsEarned = 0

    try {
      // Submit each review and award points
      for (const dishId in ratings) {
        const { rating, comment } = ratings[dishId]
        if (rating > 0) {
          const pointsEarned = await awardPointsForReview(user.uid, dishId, rating, comment)
          totalPointsEarned += pointsEarned
        }
      }

      // Set points earned and show success message
      setPointsEarned(totalPointsEarned)
      setShowSuccess(true)

      // Call the onSubmit callback
      onSubmit(ratings)

      // Close dialog after a delay if points were earned
      if (totalPointsEarned > 0) {
        setTimeout(() => {
          setShowSuccess(false)
          onClose()
        }, 3000)
      } else {
        // Close immediately if no points earned
        onClose()
      }
    } catch (error) {
      console.error("Error submitting reviews:", error)
      toast({
        title: "Error",
        description: "Failed to submit reviews. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isSubmitDisabled = Object.values(ratings).some((rating) => rating.rating === 0) || isSubmitting

  // Show success message if points were earned
  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-2xl w-full max-w-md mx-4 p-6 text-center">
          <div className="flex justify-center mb-4">
            <Star className="h-16 w-16 fill-yellow-400 text-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-4">Your reviews have been submitted successfully.</p>

          {pointsEarned > 0 && (
            <div className="bg-orange-100 p-4 rounded-lg mb-4">
              <p className="text-orange-800 font-semibold">
                You earned {pointsEarned} loyalty points for your reviews!
              </p>
            </div>
          )}

          <Button className="w-full bg-red-600 hover:bg-red-700 text-white py-6 rounded-full text-xl" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Rate Your Dishes</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <p className="text-gray-500 mb-6">
            Please rate each dish you ordered. Your feedback helps us improve our service.
          </p>

          <div className="space-y-8">
            {dishes.map((dish) => (
              <div key={dish.id} className="border-b pb-6">
                <div className="flex items-center mb-4">
                  <div className="relative h-16 w-16 flex-shrink-0 mr-3">
                    <Image
                      src={dish.image || "/placeholder.svg"}
                      alt={dish.name}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                  <h3 className="font-semibold">{dish.name}</h3>
                </div>

                <div className="flex justify-center space-x-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => handleRatingChange(dish.id, star)} className="focus:outline-none">
                      <Star
                        className={`h-8 w-8 ${
                          star <= ratings[dish.id].rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <Textarea
                  placeholder="Add a comment (optional)"
                  value={ratings[dish.id].comment}
                  onChange={(e) => handleCommentChange(dish.id, e.target.value)}
                  className="w-full rounded-lg"
                />
              </div>
            ))}
          </div>

          <Button
            className="w-full bg-red-600 hover:bg-red-700 text-white py-6 rounded-full text-xl mt-6"
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Ratings"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}


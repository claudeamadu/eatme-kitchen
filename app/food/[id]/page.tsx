"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronLeft, Heart, Minus, Plus, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertDialog } from "@/components/alert-dialog"
import { db } from "@/lib/firebase"
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/components/auth-provider" // Import the auth hook

// Food details interface
interface FoodDetails {
  id: string
  name: string
  description: string
  image: string
  prepTime: string
  sizes: {
    id: string
    name: string
    price: number
  }[]
  extras: {
    id: string
    name: string
    price: number
    image: string
  }[]
  rating: number
  reviews: number
}

// Cart item interface
interface CartItem {
  foodId: string
  name: string
  image: string
  size: string
  extras: string[]
  extrasNames?: string[]
  quantity: number
  price: number
  totalPrice: number
  userId: string
  createdAt: any
}

export default function FoodDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth() // Get the current user from auth context
  const [isFavorite, setIsFavorite] = useState(false)
  const [selectedSize, setSelectedSize] = useState("medium")
  const [selectedExtras, setSelectedExtras] = useState<string[]>([])
  const [quantity, setQuantity] = useState(1)
  const [showAddToCartDialog, setShowAddToCartDialog] = useState(false)
  const [food, setFood] = useState<FoodDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)

  // Fetch food details from Firestore
  useEffect(() => {
    const fetchFoodDetails = async () => {
      try {
        setLoading(true)
        const foodDoc = await getDoc(doc(db, "foodItems", params.id))

        if (foodDoc.exists()) {
          setFood({ id: foodDoc.id, ...foodDoc.data() } as FoodDetails)

          // Set default selected size to medium if available, otherwise first size
          if (foodDoc.data().sizes && foodDoc.data().sizes.length > 0) {
            const mediumSize = foodDoc.data().sizes.find((size: any) => size.id === "medium")
            if (mediumSize) {
              setSelectedSize("medium")
            } else {
              setSelectedSize(foodDoc.data().sizes[0].id)
            }
          }
        } else {
          // If food not found in Firestore, try to use fallback data
          console.log("Food not found in Firestore, using fallback data")
        }
      } catch (error) {
        console.error("Error fetching food details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFoodDetails()
  }, [params.id])

  // Handle if food not found
  if (!loading && !food) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>Food item not found</p>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    )
  }

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
  }

  const handleExtraToggle = (extraId: string) => {
    if (selectedExtras.includes(extraId)) {
      setSelectedExtras(selectedExtras.filter((id) => id !== extraId))
    } else {
      setSelectedExtras([...selectedExtras, extraId])
    }
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const increaseQuantity = () => {
    setQuantity(quantity + 1)
  }

  // Calculate total price
  const calculateTotalPrice = () => {
    if (!food) return 0

    const sizePrice = food.sizes.find((size) => size.id === selectedSize)?.price || 0
    const extrasPrice = selectedExtras.reduce((total, extraId) => {
      const extra = food.extras.find((e) => e.id === extraId)
      return total + (extra?.price || 0)
    }, 0)

    return (sizePrice + extrasPrice) * quantity
  }

  const addToCart = async () => {
    if (!food) return

    try {
      setAddingToCart(true)

      // Get the selected size and extras details
      const selectedSizeDetails = food.sizes.find((size) => size.id === selectedSize)
      const selectedExtrasDetails = food.extras.filter((extra) => selectedExtras.includes(extra.id))

      // Use the user ID from auth context or a fallback value
      const userId = user?.uid || "guest-user"

      // Create cart item
      const cartItem: CartItem = {
        foodId: food.id,
        name: food.name,
        image: food.image,
        size: selectedSize,
        extras: selectedExtras,
        extrasNames: selectedExtrasDetails.map((extra) => extra.name), // Add extra names
        quantity: quantity,
        price:
          (selectedSizeDetails?.price || 0) + selectedExtrasDetails.reduce((total, extra) => total + extra.price, 0),
        totalPrice: calculateTotalPrice(),
        userId: userId, // Use the user ID from auth context
        createdAt: serverTimestamp(),
      }

      // Add to Firestore
      await addDoc(collection(db, "cartItems"), cartItem)

      // Show success dialog
      setShowAddToCartDialog(true)
    } catch (error) {
      console.error("Error adding to cart:", error)
      alert("Failed to add item to cart. Please try again.")
    } finally {
      setAddingToCart(false)
    }
  }

  const handleConfirmAddToCart = () => {
    setShowAddToCartDialog(false)
    router.push("/cart")
  }

  return (
    <main className="flex min-h-screen flex-col pb-24">
      {/* Food Image */}
      <div className="relative h-72 w-full">
        <Button
          variant="outline"
          size="icon"
          className="absolute top-4 left-4 z-10 bg-white rounded-full"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="absolute top-4 right-4 z-10 bg-white rounded-full"
          onClick={toggleFavorite}
        >
          <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-600 text-red-600" : ""}`} />
        </Button>

        {loading ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <Image src={food?.image || "/placeholder.svg"} alt={food?.name || "Food"} fill className="object-cover" />
        )}
      </div>

      {/* Food Details */}
      <div className="flex-1 bg-white rounded-t-3xl -mt-6 p-6 shadow-md">
        {loading ? (
          <>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <div className="flex items-center mb-4">
              <Skeleton className="h-4 w-16 mr-2" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-6" />

            <Skeleton className="h-5 w-40 mb-2" />
            <Skeleton className="h-4 w-24 mb-6" />

            <Skeleton className="h-5 w-40 mb-2" />
            <div className="flex gap-2 mb-6">
              <Skeleton className="h-12 flex-1 rounded-lg" />
              <Skeleton className="h-12 flex-1 rounded-lg" />
              <Skeleton className="h-12 flex-1 rounded-lg" />
            </div>

            <Skeleton className="h-5 w-40 mb-2" />
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-32 rounded-lg" />
              <Skeleton className="h-32 rounded-lg" />
              <Skeleton className="h-32 rounded-lg" />
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-1">{food?.name}</h1>

            <div className="flex items-center mb-4">
              <div className="flex items-center">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="ml-1 text-sm font-medium">{food?.rating}</span>
              </div>
              <span className="mx-2 text-gray-300">|</span>
              <span className="text-sm text-gray-500">{food?.reviews} reviews</span>
            </div>

            <p className="text-gray-600 mb-6">{food?.description}</p>

            <div className="mb-6">
              <h2 className="text-sm font-medium mb-2">Preparation Time</h2>
              <p className="text-gray-600">{food?.prepTime}</p>
            </div>

            <div className="mb-6">
              <h2 className="text-sm font-medium mb-2">Available Sizes</h2>
              <RadioGroup value={selectedSize} onValueChange={setSelectedSize} className="flex gap-2">
                {food?.sizes.map((size) => (
                  <div
                    key={size.id}
                    className={`flex-1 border rounded-lg p-2 text-center cursor-pointer ${
                      selectedSize === size.id ? "bg-red-600 text-white" : "bg-white"
                    }`}
                  >
                    <RadioGroupItem value={size.id} id={size.id} className="sr-only" />
                    <Label htmlFor={size.id} className="cursor-pointer">
                      <div>{size.name}</div>
                      <div className="font-bold">GHC {size.price}</div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="mb-6">
              <h2 className="text-sm font-medium mb-2">Extras</h2>
              <div className="grid grid-cols-3 gap-2">
                {food?.extras.map((extra) => (
                  <div
                    key={extra.id}
                    className={`border rounded-lg p-2 text-center cursor-pointer ${
                      selectedExtras.includes(extra.id) ? "border-red-600 bg-red-50" : ""
                    }`}
                    onClick={() => handleExtraToggle(extra.id)}
                  >
                    <div className="relative h-16 w-16 mx-auto mb-1">
                      <Image
                        src={extra.image || "/placeholder.svg"}
                        alt={extra.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    <div className="text-xs">{extra.name}</div>
                    <div className="text-xs font-bold text-red-600">GHC {extra.price}</div>
                    <Checkbox checked={selectedExtras.includes(extra.id)} className="sr-only" />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add to Cart Section */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t flex items-center justify-between shadow-lg">
        <div className="flex items-center bg-gray-100 rounded-full">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full text-gray-500"
            onClick={decreaseQuantity}
            disabled={loading}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-8 text-center">{quantity}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full text-gray-500"
            onClick={increaseQuantity}
            disabled={loading}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <Button
          className="flex-1 ml-4 bg-red-600 hover:bg-red-700 text-white shadow-md"
          onClick={addToCart}
          disabled={loading || addingToCart}
        >
          {addingToCart ? (
            <span className="flex items-center">
              <span className="animate-spin mr-2">◌</span>
              Adding...
            </span>
          ) : (
            <>
              Add to cart <span className="ml-2">GHC {calculateTotalPrice().toFixed(2)}</span>
            </>
          )}
        </Button>
      </div>

      {/* Add to Cart Dialog */}
      <AlertDialog
        isOpen={showAddToCartDialog}
        title="Added to Cart"
        message={`${quantity} ${food?.name} has been added to your cart.`}
        confirmText="View Cart"
        cancelText="Continue Shopping"
        onConfirm={handleConfirmAddToCart}
        onCancel={() => setShowAddToCartDialog(false)}
      />
    </main>
  )
}


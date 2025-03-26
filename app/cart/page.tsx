"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronLeft, Edit, Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import BottomNav from "@/components/BottomNav"
import { AlertDialog } from "@/components/alert-dialog"
import { db, auth } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { Skeleton } from "@/components/ui/skeleton"
import { getCartItems, updateCartItem, deleteCartItem, type CartItem, getLoyaltyPoints } from "@/lib/firestore-utils"
import { useToast } from "@/hooks/use-toast"

export default function CartPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loyaltyPoints, setLoyaltyPoints] = useState(0)
  const [applyLoyalty, setApplyLoyalty] = useState(false)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User authenticated:", user.uid)
        setUserId(user.uid)
        fetchLoyaltyPoints(user.uid)
        fetchCartItems(user.uid)
      } else {
        console.log("No user authenticated, redirecting to login")
        setLoading(false)
        router.push("/auth/login")
      }
    })

    return () => unsubscribe()
  }, [router])

  const fetchCartItems = async (uid: string) => {
    try {
      setLoading(true)
      console.log("Fetching cart items for user:", uid)

      // Try to get items from cartItems collection
      const items = await getCartItems(uid)
      console.log("Items from cartItems collection:", items)

      // If no items found, check the cart collection as fallback
      if (items.length === 0) {
        console.log("No items found in cartItems, checking cart collection")
        const cartRef = collection(db, "cart")
        const q = query(cartRef, where("userId", "==", uid))
        const snapshot = await getDocs(q)

        if (!snapshot.empty) {
          console.log("Found items in cart collection:", snapshot.size)
          const cartItems: CartItem[] = []

          snapshot.forEach((doc) => {
            const data = doc.data()
            cartItems.push({
              id: doc.id,
              foodId: data.foodId || "",
              name: data.name || "",
              image: data.image || "",
              size: data.size || "regular",
              extras: data.extras || [],
              quantity: data.quantity || 1,
              price: data.price || 0,
              totalPrice: data.price * data.quantity || 0,
              userId: uid,
              createdAt: data.createdAt || new Date(),
            })
          })

          setCartItems(cartItems)
          console.log("Set cart items from cart collection:", cartItems)
          return
        }
      }

      setCartItems(items)
    } catch (error) {
      console.error("Error fetching cart items:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLoyaltyPoints = async (uid: string) => {
    try {
      // First try to get from loyaltyPoints collection
      const loyaltyData = await getLoyaltyPoints(uid)

      if (loyaltyData) {
        setLoyaltyPoints(loyaltyData.points)
        return
      }

      // Fallback to users collection
      const userSnap = await getDocs(query(collection(db, "users"), where("uid", "==", uid)))

      if (!userSnap.empty) {
        const userData = userSnap.docs[0].data()
        setLoyaltyPoints(userData.loyaltyPoints || 0)
      } else {
        // No loyalty points found
        toast({
          title: "No Loyalty Points",
          description: "You don't have any loyalty points yet. Complete orders to earn points!",
          variant: "default",
        })
      }
    } catch (error) {
      console.error("Error fetching loyalty points:", error)
      toast({
        title: "Error",
        description: "Could not load your loyalty points. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Calculate cart total
  const cartTotal = cartItems.reduce((total, item) => total + item.totalPrice, 0)

  // Calculate loyalty points value (100 points = 5 cedis)
  const loyaltyPointsValue = Math.min(loyaltyPoints / 20, cartTotal)

  // Calculate final total
  const finalTotal = applyLoyalty ? Math.max(0, cartTotal - loyaltyPointsValue) : cartTotal

  const updateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) return

    try {
      // Find the item to get its price
      const item = cartItems.find((item) => item.id === id)
      if (!item) return

      // Calculate new total price
      const newTotalPrice = item.price * newQuantity

      await updateCartItem(id, {
        quantity: newQuantity,
        totalPrice: newTotalPrice,
      })

      // Update local state
      setCartItems(
        cartItems.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity, totalPrice: newTotalPrice } : item,
        ),
      )
    } catch (error) {
      console.error("Error updating quantity:", error)
    }
  }

  const confirmRemoveItem = (id: string) => {
    setItemToDelete(id)
    setShowDeleteAlert(true)
  }

  const removeItem = async () => {
    if (itemToDelete !== null) {
      try {
        await deleteCartItem(itemToDelete)

        // Update local state
        setCartItems(cartItems.filter((item) => item.id !== itemToDelete))

        setShowDeleteAlert(false)
        setItemToDelete(null)
      } catch (error) {
        console.error("Error removing item:", error)
      }
    }
  }

  const toggleLoyaltyPoints = () => {
    setApplyLoyalty(!applyLoyalty)
  }

  const handleCheckout = () => {
    // Save the cart state including loyalty points usage
    if (userId) {
      const checkoutData = {
        userId,
        items: cartItems,
        subtotal: cartTotal,
        loyaltyPoints: loyaltyPoints,
        loyaltyPointsUsed: applyLoyalty ? loyaltyPointsValue : 0,
        total: finalTotal,
        createdAt: new Date(),
      }

      // Store checkout data in session storage for the next steps
      sessionStorage.setItem("checkoutData", JSON.stringify(checkoutData))
    }

    router.push("/delivery-method")
  }

  const handleEditItem = (id: string, foodId: string) => {
    router.push(`/food/${foodId}?cartItemId=${id}`)
  }

  if (loading) {
    return <CartLoadingState />
  }

  return (
    <main className="flex flex-col h-screen">
      {/* Fixed background with food icons pattern */}
      <div className="fixed inset-0 z-0 bg-gray-100">
        <div className="absolute inset-0 opacity-15">
          <Image src="/images/background.png" alt="Food pattern" fill className="object-cover" />
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-10 p-4 flex items-center bg-white">
        <Button variant="outline" size="icon" className="mr-2 rounded-full bg-white" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Cart</h1>
      </header>

      {/* Scrollable content */}
      <div className="flex-1 overflow-auto pb-40">
        {/* Cart Items */}
        <section className="relative z-10 px-4">
          {cartItems.length > 0 ? (
            <div className="space-y-4 mb-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="p-4 rounded-lg shadow-md bg-white">
                  <div className="flex gap-3">
                    <div className="relative h-20 w-20 flex-shrink-0">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-yellow-500"
                            onClick={() => handleEditItem(item.id, item.foodId)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500"
                            onClick={() => confirmRemoveItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">
                        {item.extrasNames && item.extrasNames.length > 0
                          ? item.extrasNames.join(", ")
                          : item.extras && item.extras.length > 0
                            ? item.extras.join(", ")
                            : "Regular"}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-red-600 font-bold">GHC {item.price}</p>
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-none bg-red-800 text-white hover:bg-red-900"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center text-lg">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-none bg-red-600 text-white hover:bg-red-700"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-20">
              <p className="text-gray-500 mb-4">Your cart is empty</p>
              <div className="space-y-4">
                <Button className="bg-red-600 hover:bg-red-700" onClick={() => router.push("/menu")}>
                  Browse Menu
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Cart Summary - Fixed at bottom */}
      {cartItems.length > 0 && (
        <>
          {/* Loyalty Points Bar */}
          {loyaltyPoints > 0 && (
            <div className="fixed bottom-[180px] left-0 right-0 z-20 px-4">
              <div className="flex items-center justify-between bg-orange-400 text-white p-4 rounded-lg">
                <span className="font-semibold text-lg">Loyalty Points</span>
                <Button
                  className={`${applyLoyalty ? "bg-red-600" : "bg-red-600"} hover:bg-red-700 text-white`}
                  onClick={toggleLoyaltyPoints}
                >
                  {applyLoyalty ? "APPLIED" : "APPLY"}
                </Button>
              </div>
            </div>
          )}

          {/* Cart Total */}
          <section className="fixed bottom-0 left-0 right-0 z-20 bg-gray-200 p-4 rounded-t-3xl shadow-inner">
            <div className="space-y-2">
              <div className="flex justify-between text-lg">
                <span>Cart Total</span>
                <span className="font-semibold">GHC {cartTotal.toFixed(2)}</span>
              </div>

              {applyLoyalty && loyaltyPoints > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Loyalty Points ({loyaltyPoints} points)</span>
                  <span>- GHC {loyaltyPointsValue.toFixed(2)}</span>
                </div>
              )}

              <Separator className="my-2 border-dashed border-gray-400" />

              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>GHC {finalTotal.toFixed(2)}</span>
              </div>

              <Button
                className="w-full bg-red-600 hover:bg-red-700 text-white py-6 rounded-xl text-xl mt-4"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </Button>
            </div>
          </section>
        </>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-10">
        <BottomNav active="cart" />
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={showDeleteAlert}
        title="Remove Item"
        message="Are you sure you want to remove this item from your cart?"
        confirmText="Remove"
        cancelText="Cancel"
        onConfirm={removeItem}
        onCancel={() => setShowDeleteAlert(false)}
      />
    </main>
  )
}

function CartLoadingState() {
  return (
    <main className="flex flex-col h-screen">
      {/* Fixed background */}
      <div className="fixed inset-0 z-0 bg-gray-100">
        <div className="absolute inset-0 opacity-15">
          <Image src="/images/background.png" alt="Food pattern" fill className="object-cover" />
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-10 p-4 flex items-center bg-white">
        <Button variant="outline" size="icon" className="mr-2 rounded-full bg-white" disabled>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Cart</h1>
      </header>

      {/* Scrollable content */}
      <div className="flex-1 overflow-auto pb-40">
        {/* Cart Items */}
        <section className="relative z-10 px-4">
          <div className="space-y-4 mb-4">
            {[1, 2].map((i) => (
              <Card key={i} className="p-4 rounded-lg shadow-md bg-white">
                <div className="flex gap-3">
                  <Skeleton className="h-20 w-20 rounded-md" />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <Skeleton className="h-5 w-32 mb-2" />
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                    </div>
                    <Skeleton className="h-3 w-full max-w-xs mb-2" />
                    <div className="flex justify-between items-center mt-2">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-8 w-24 rounded-full" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Loyalty Points */}
          <div className="mt-4">
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        </section>
      </div>

      {/* Cart Summary - Fixed at bottom */}
      <section className="fixed bottom-0 left-0 right-0 z-20 bg-gray-200 p-4 rounded-t-3xl shadow-inner">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>

          <Skeleton className="h-1 w-full my-2" />

          <div className="flex justify-between">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-24" />
          </div>

          <Skeleton className="h-14 w-full rounded-xl mt-4" />
        </div>
      </section>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-10">
        <BottomNav active="cart" />
      </div>
    </main>
  )
}


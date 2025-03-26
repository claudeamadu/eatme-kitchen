import { db } from "@/lib/firebase"
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
  orderBy,
  serverTimestamp,
  increment,
  arrayUnion,
  type Timestamp,
} from "firebase/firestore"

// Interface for cart item
export interface CartItem {
  id: string
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

// Interface for order
export interface Order {
  id: string
  userId: string
  items: CartItem[]
  totalAmount: number
  subtotal: number
  deliveryFee: number
  loyaltyPointsUsed: number
  status: "pending" | "processing" | "delivered" | "cancelled"
  deliveryAddress?: string
  deliveryCoordinates?: {
    lat: number
    lng: number
  }
  paymentMethod: string
  createdAt: any
}

// Interface for loyalty points
export interface LoyaltyPoints {
  id: string
  userId: string
  points: number
  history: {
    date: any
    points: number
    reason: string
  }[]
  orderedItems?: string[] // Track unique items ordered
  reviewsSubmitted?: number // Track number of reviews submitted
  lastBirthdayReward?: Timestamp // Track when birthday reward was last given
}

// Get cart items for a user
export const getCartItems = async (userId: string): Promise<CartItem[]> => {
  try {
    const cartQuery = query(collection(db, "cartItems"), where("userId", "==", userId), orderBy("createdAt", "desc"))

    const querySnapshot = await getDocs(cartQuery)
    const cartItems: CartItem[] = []

    querySnapshot.forEach((doc) => {
      cartItems.push({ id: doc.id, ...doc.data() } as CartItem)
    })

    return cartItems
  } catch (error) {
    console.error("Error getting cart items:", error)
    throw error
  }
}

// Add item to cart
export const addToCart = async (cartItem: Omit<CartItem, "id">): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "cartItems"), cartItem)
    return docRef.id
  } catch (error) {
    console.error("Error adding to cart:", error)
    throw error
  }
}

// Update cart item
export const updateCartItem = async (id: string, data: Partial<CartItem>): Promise<void> => {
  try {
    await updateDoc(doc(db, "cartItems", id), data)
  } catch (error) {
    console.error("Error updating cart item:", error)
    throw error
  }
}

// Delete cart item
export const deleteCartItem = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "cartItems", id))
  } catch (error) {
    console.error("Error deleting cart item:", error)
    throw error
  }
}

// Clear cart after order
export const clearCart = async (userId: string): Promise<void> => {
  try {
    const cartItems = await getCartItems(userId)

    // Delete each cart item
    for (const item of cartItems) {
      await deleteCartItem(item.id)
    }
  } catch (error) {
    console.error("Error clearing cart:", error)
    throw error
  }
}

// Save order to Firestore
export const saveOrder = async (orderData: Omit<Order, "id">): Promise<string> => {
  try {
    // Add order to Firestore
    const orderRef = await addDoc(collection(db, "orders"), {
      ...orderData,
      createdAt: serverTimestamp(),
    })

    // Clear the user's cart
    await clearCart(orderData.userId)

    return orderRef.id
  } catch (error) {
    console.error("Error saving order:", error)
    throw error
  }
}

// Get orders for a user
export const getOrders = async (userId: string): Promise<Order[]> => {
  try {
    const ordersQuery = query(collection(db, "orders"), where("userId", "==", userId), orderBy("createdAt", "desc"))

    const querySnapshot = await getDocs(ordersQuery)
    const orders: Order[] = []

    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() } as Order)
    })

    return orders
  } catch (error) {
    console.error("Error getting orders:", error)
    throw error
  }
}

// Get a single order
export const getOrder = async (orderId: string): Promise<Order | null> => {
  try {
    const orderDoc = await getDoc(doc(db, "orders", orderId))

    if (orderDoc.exists()) {
      return { id: orderDoc.id, ...orderDoc.data() } as Order
    }

    return null
  } catch (error) {
    console.error("Error getting order:", error)
    throw error
  }
}

// Get loyalty points for a user
export const getLoyaltyPoints = async (userId: string): Promise<LoyaltyPoints | null> => {
  try {
    const loyaltyQuery = query(collection(db, "loyaltyPoints"), where("userId", "==", userId))

    const querySnapshot = await getDocs(loyaltyQuery)

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      return { id: doc.id, ...doc.data() } as LoyaltyPoints
    }

    return null
  } catch (error) {
    console.error("Error getting loyalty points:", error)
    throw error
  }
}

// Add loyalty points
export const addLoyaltyPoints = async (userId: string, points: number, reason: string): Promise<void> => {
  try {
    // Check if user already has loyalty points
    const existingPoints = await getLoyaltyPoints(userId)

    if (existingPoints) {
      // Update existing loyalty points
      await updateDoc(doc(db, "loyaltyPoints", existingPoints.id), {
        points: existingPoints.points + points,
        history: arrayUnion({
          date: new Date(),
          points,
          reason,
        }),
      })
    } else {
      // Create new loyalty points document
      await addDoc(collection(db, "loyaltyPoints"), {
        userId,
        points,
        history: [
          {
            date: new Date(),
            points,
            reason,
          },
        ],
        orderedItems: [],
        reviewsSubmitted: 0,
      })
    }
  } catch (error) {
    console.error("Error adding loyalty points:", error)
    throw error
  }
}

// Award points for new items (up to 7 items)
export const awardPointsForNewItems = async (userId: string, items: CartItem[]): Promise<number> => {
  try {
    const loyaltyData = await getLoyaltyPoints(userId)
    let pointsAwarded = 0

    if (!loyaltyData) {
      // Create new loyalty record if it doesn't exist
      await addDoc(collection(db, "loyaltyPoints"), {
        userId,
        points: 0,
        history: [],
        orderedItems: [],
        reviewsSubmitted: 0,
      })

      const newLoyaltyData = await getLoyaltyPoints(userId)
      if (!newLoyaltyData) return 0

      const loyaltyData = newLoyaltyData
    }

    // Get unique food IDs from the order
    const foodIds = [...new Set(items.map((item) => item.foodId))]

    // Get previously ordered items
    const orderedItems = loyaltyData.orderedItems || []

    // Find new items that haven't been ordered before
    const newItems = foodIds.filter((id) => !orderedItems.includes(id))

    if (newItems.length > 0) {
      // Award 50 points per new item
      const pointsPerNewItem = 50
      pointsAwarded = newItems.length * pointsPerNewItem

      // Update loyalty points
      await updateDoc(doc(db, "loyaltyPoints", loyaltyData.id), {
        points: increment(pointsAwarded),
        orderedItems: arrayUnion(...newItems),
        history: arrayUnion({
          date: new Date(),
          points: pointsAwarded,
          reason: `Tried ${newItems.length} new item(s)`,
        }),
      })
    }

    return pointsAwarded
  } catch (error) {
    console.error("Error awarding points for new items:", error)
    return 0
  }
}

// Award points for birthday
export const awardBirthdayPoints = async (userId: string): Promise<number> => {
  try {
    // Get user data to check birthday
    const userDoc = await getDoc(doc(db, "users", userId))
    if (!userDoc.exists()) return 0

    const userData = userDoc.data()
    const dateOfBirth = userData.dateOfBirth

    if (!dateOfBirth) return 0

    // Check if today is user's birthday
    const today = new Date()
    const birthDate = new Date(dateOfBirth)

    const isBirthday = today.getDate() === birthDate.getDate() && today.getMonth() === birthDate.getMonth()

    if (!isBirthday) return 0

    // Get loyalty data
    const loyaltyData = await getLoyaltyPoints(userId)
    if (!loyaltyData) return 0

    // Check if birthday reward was already given this year
    const lastBirthdayReward = loyaltyData.lastBirthdayReward ? loyaltyData.lastBirthdayReward.toDate() : null

    if (lastBirthdayReward && lastBirthdayReward.getFullYear() === today.getFullYear()) {
      return 0 // Already awarded birthday points this year
    }

    // Award 200 points for birthday
    const birthdayPoints = 200

    await updateDoc(doc(db, "loyaltyPoints", loyaltyData.id), {
      points: increment(birthdayPoints),
      lastBirthdayReward: serverTimestamp(),
      history: arrayUnion({
        date: new Date(),
        points: birthdayPoints,
        reason: "Birthday celebration",
      }),
    })

    return birthdayPoints
  } catch (error) {
    console.error("Error awarding birthday points:", error)
    return 0
  }
}

// Award points for reviews (up to 8 reviews)
export const awardPointsForReview = async (
  userId: string,
  dishId: string,
  rating: number,
  comment: string,
): Promise<number> => {
  try {
    // Save the review
    await addDoc(collection(db, "reviews"), {
      userId,
      dishId,
      rating,
      comment,
      createdAt: serverTimestamp(),
    })

    // Get loyalty data
    const loyaltyData = await getLoyaltyPoints(userId)
    if (!loyaltyData) return 0

    // Check if user has already submitted 8 or more reviews
    const reviewsSubmitted = loyaltyData.reviewsSubmitted || 0
    if (reviewsSubmitted >= 8) return 0

    // Award 25 points per review
    const reviewPoints = 25

    await updateDoc(doc(db, "loyaltyPoints", loyaltyData.id), {
      points: increment(reviewPoints),
      reviewsSubmitted: increment(1),
      history: arrayUnion({
        date: new Date(),
        points: reviewPoints,
        reason: `Submitted review #${reviewsSubmitted + 1}`,
      }),
    })

    return reviewPoints
  } catch (error) {
    console.error("Error awarding points for review:", error)
    return 0
  }
}


"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShoppingCart, Bell, Heart, Plus, ChevronRight, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BottomNav } from "@/components/bottom-nav"
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/components/auth-provider"
import { Skeleton } from "@/components/ui/skeleton"

// Types
interface Promo {
  id: string
  title: string
  description: string
  image: string
  buttonText: string
  actionUrl: string
  bgColor: string
  textColor: string
}

interface FoodItem {
  id: string
  name: string
  description: string
  image: string
  price: number
  minPrice?: number
  maxPrice?: number
  category: string
  isPopular?: boolean
  isDailySpecial?: boolean
}

export default function HomePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [activePromoSlide, setActivePromoSlide] = useState(0)
  const [favorites, setFavorites] = useState<string[]>([])
  const [promos, setPromos] = useState<Promo[]>([])
  const [dailySpecials, setDailySpecials] = useState<FoodItem[]>([])
  const [popularDishes, setPopularDishes] = useState<FoodItem[]>([])
  const [isLoadingPromos, setIsLoadingPromos] = useState(true)
  const [isLoadingSpecials, setIsLoadingSpecials] = useState(true)
  const [isLoadingPopular, setIsLoadingPopular] = useState(true)
  const promoSliderRef = useRef<HTMLDivElement>(null)

  // Get current time to display appropriate greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning!"
    if (hour < 18) return "Good Afternoon!"
    return "Good Evening!"
  }

  // Fetch user favorites
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return

      try {
        const favoritesRef = collection(db, "users", user.uid, "favorites")
        const favoritesSnapshot = await getDocs(favoritesRef)
        const favoritesData = favoritesSnapshot.docs.map((doc) => doc.id)
        setFavorites(favoritesData)
      } catch (error) {
        console.error("Error fetching favorites:", error)
      }
    }

    fetchFavorites()
  }, [user])

  // Fetch promos from Firestore
  useEffect(() => {
    const fetchPromos = async () => {
      setIsLoadingPromos(true)
      try {
        const promosRef = collection(db, "promos")
        const promosQuery = query(promosRef, orderBy("order", "asc"))
        const promosSnapshot = await getDocs(promosQuery)

        const promosData = promosSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Promo[]

        setPromos(promosData)
      } catch (error) {
        console.error("Error fetching promos:", error)
        // Fallback to default promos if fetch fails
        setPromos(defaultPromos)
      } finally {
        setIsLoadingPromos(false)
      }
    }

    fetchPromos()
  }, [])

  // Fetch daily specials from Firestore
  useEffect(() => {
    const fetchDailySpecials = async () => {
      setIsLoadingSpecials(true)
      try {
        const foodRef = collection(db, "foods")
        const specialsQuery = query(foodRef, where("isDailySpecial", "==", true), limit(2))
        const specialsSnapshot = await getDocs(specialsQuery)

        const specialsData = specialsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as FoodItem[]

        setDailySpecials(specialsData)
      } catch (error) {
        console.error("Error fetching daily specials:", error)
        // Fallback to default specials if fetch fails
        setDailySpecials(defaultDailySpecials)
      } finally {
        setIsLoadingSpecials(false)
      }
    }

    fetchDailySpecials()
  }, [])

  // Fetch popular dishes from Firestore
  useEffect(() => {
    const fetchPopularDishes = async () => {
      setIsLoadingPopular(true)
      try {
        const foodRef = collection(db, "foods")
        const popularQuery = query(foodRef, where("isPopular", "==", true), limit(4))
        const popularSnapshot = await getDocs(popularQuery)

        const popularData = popularSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as FoodItem[]

        setPopularDishes(popularData)
      } catch (error) {
        console.error("Error fetching popular dishes:", error)
        // Fallback to default popular dishes if fetch fails
        setPopularDishes(defaultPopularDishes)
      } finally {
        setIsLoadingPopular(false)
      }
    }

    fetchPopularDishes()
  }, [])

  const toggleFavorite = async (id: string) => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    try {
      // Toggle in UI immediately for better UX
      if (favorites.includes(id)) {
        setFavorites(favorites.filter((favId) => favId !== id))
      } else {
        setFavorites([...favorites, id])
      }

      // TODO: Update in Firestore
    } catch (error) {
      console.error("Error toggling favorite:", error)
    }
  }

  // Default data for fallbacks
  const defaultPromos: Promo[] = [
    {
      id: "1",
      title: "Mother's Day Promo!",
      description: "Make Mama feel special with our special Mama's Lunch!",
      image: "/images/banners/mama-lunch.jpg",
      buttonText: "Order Now!",
      actionUrl: "/menu",
      bgColor: "bg-gray-100",
      textColor: "text-gray-600",
    },
    {
      id: "2",
      title: "Loyalty Rewards",
      description: "Earn points with every order and get exclusive discounts!",
      image: "/images/banners/loyalty-offer.jpg",
      buttonText: "View Rewards",
      actionUrl: "/settings/loyalty",
      bgColor: "bg-gray-100",
      textColor: "text-gray-600",
    },
    {
      id: "3",
      title: "Weekend Special Offer!",
      description: "Get 20% off on all orders above GHC 100 this weekend!",
      image: "/images/food/fried-rice.jpg",
      buttonText: "Claim Offer",
      actionUrl: "/menu",
      bgColor: "bg-gradient-to-r from-orange-500 to-red-500",
      textColor: "text-white",
    },
  ]

  const defaultDailySpecials: FoodItem[] = [
    {
      id: "1",
      name: "Assorted Jollof",
      description: "Experience a unique mix of flavors that will elevate your dining experience.",
      image: "/images/food/assorted-jollof.jpg",
      price: 50,
      category: "Rice",
    },
    {
      id: "2",
      name: "Braised Rice",
      description: "Experience a unique mix of flavors that will elevate your dining experience.",
      image: "/images/food/braised-rice.jpg",
      price: 30,
      category: "Rice",
    },
  ]

  const defaultPopularDishes: FoodItem[] = [
    {
      id: "1",
      name: "Assorted Jollof",
      description: "Freshly made Jollof rice with vegetables, chicken...",
      image: "/images/food/assorted-jollof.jpg",
      price: 50,
      minPrice: 50,
      maxPrice: 120,
      category: "Rice",
    },
    {
      id: "2",
      name: "Sea Food Jollof",
      description: "Freshly made Jollof rice with vegetables, chicken...",
      image: "/images/food/assorted-noodles.jpg",
      price: 65,
      minPrice: 65,
      maxPrice: 120,
      category: "Rice",
    },
  ]

  // Handle promo carousel navigation
  const navigatePromo = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setActivePromoSlide((prev) => (prev === 0 ? promos.length - 1 : prev - 1))
    } else {
      setActivePromoSlide((prev) => (prev === promos.length - 1 ? 0 : prev + 1))
    }
  }

  // Update carousel position when active slide changes
  useEffect(() => {
    if (promoSliderRef.current && promos.length > 0) {
      const slideWidth = 100 / promos.length
      promoSliderRef.current.style.transform = `translateX(-${activePromoSlide * slideWidth}%)`
    }
  }, [activePromoSlide, promos.length])

  // Update the return statement to match the original cart page design while keeping the Firestore integration
  return (
    <main className="flex min-h-screen flex-col pb-16 bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white p-4 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-lg font-bold">
            {getGreeting()} {user?.displayName?.split(" ")[0] || "Guest"}
          </h1>
          <p className="text-xs text-gray-500">We hope you're in a good mood to dine.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="text-red-600" onClick={() => router.push("/cart")}>
            <ShoppingCart className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-red-600" onClick={() => router.push("/notifications")}>
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto">
        {/* Single Promo Carousel */}
        <section className="p-4">
          {isLoadingPromos ? (
            <Skeleton className="h-40 w-full rounded-xl" />
          ) : promos.length > 0 ? (
            <div className="relative overflow-hidden rounded-xl">
              {/* Carousel Container */}
              <div
                ref={promoSliderRef}
                className="flex transition-transform duration-300 ease-in-out"
                style={{ width: `${promos.length * 100}%` }}
              >
                {promos.map((promo, index) => (
                  <div key={promo.id} className="w-full px-1" style={{ flex: `0 0 ${100 / promos.length}%` }}>
                    <Card className={`rounded-xl overflow-hidden shadow-md ${promo.bgColor}`}>
                      <div className="relative p-4">
                        <div className="flex">
                          <div className="flex-1 pr-4">
                            <h2
                              className={`font-bold text-lg ${promo.textColor === "text-white" ? "text-white" : "text-gray-900"}`}
                            >
                              {promo.title}
                            </h2>
                            <p className={`text-sm mb-4 ${promo.textColor}`}>{promo.description}</p>
                            <Button
                              className={
                                promo.textColor === "text-white"
                                  ? "bg-white text-red-600 hover:bg-gray-100"
                                  : "bg-red-600 hover:bg-red-700 text-white"
                              }
                              onClick={() => router.push(promo.actionUrl)}
                            >
                              {promo.buttonText}
                            </Button>
                          </div>
                          <div className="relative h-24 w-24 flex-shrink-0">
                            <Image
                              src={promo.image || "/placeholder.svg?height=96&width=96"}
                              alt={promo.title}
                              fill
                              className="object-cover rounded-full"
                              sizes="96px"
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>

              {/* Carousel Controls */}
              <button
                className="absolute left-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 text-gray-700 flex items-center justify-center shadow-md z-10"
                onClick={() => navigatePromo("prev")}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 text-gray-700 flex items-center justify-center shadow-md z-10"
                onClick={() => navigatePromo("next")}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center items-center h-40 bg-gray-100 rounded-xl">
              <p className="text-gray-500">No promotions available</p>
            </div>
          )}
        </section>

        {/* Carousel Indicators */}
        {!isLoadingPromos && promos.length > 1 && (
          <div className="flex justify-center gap-1 my-1">
            {promos.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full cursor-pointer ${activePromoSlide === index ? "bg-red-600" : "bg-gray-300"}`}
                onClick={() => setActivePromoSlide(index)}
              ></div>
            ))}
          </div>
        )}

        {/* Daily Specials */}
        <section className="p-4">
          <h2 className="text-lg font-semibold mb-3">Daily Specials</h2>
          {isLoadingSpecials ? (
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          ) : dailySpecials.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {dailySpecials.map((item) => (
                <Card
                  key={item.id}
                  className="rounded-xl overflow-hidden cursor-pointer"
                  onClick={() => router.push(`/food/${item.id}`)}
                >
                  <div className="relative h-24 w-full">
                    <Image
                      src={item.image || "/placeholder.svg?height=96&width=192"}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 192px"
                    />
                  </div>
                  <div className="p-2">
                    <h3 className="font-semibold text-sm">{item.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-1">{item.description}</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-red-600 font-bold text-sm">GHC {item.price}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorite(item.id)
                        }}
                      >
                        <Heart
                          className={`h-4 w-4 ${favorites.includes(item.id) ? "fill-red-600 text-red-600" : ""}`}
                        />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center h-48 bg-gray-100 rounded-xl">
              <p className="text-gray-500">No daily specials available</p>
            </div>
          )}
        </section>

        {/* Special Occasion Banner */}
        <section className="p-4">
          <Card className="rounded-xl overflow-hidden">
            <div className="p-4 bg-white">
              <div className="flex items-center">
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Celebrating a special occasion or event?</h3>
                  <Button className="bg-red-600 hover:bg-red-700" onClick={() => router.push("/table-reservation")}>
                    Reserve your table now!
                  </Button>
                </div>
                <div className="relative h-20 w-20 flex-shrink-0">
                  <Image
                    src="/images/reservation-table.png"
                    alt="Reserve a table"
                    fill
                    className="object-contain"
                    sizes="80px"
                  />
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Popular Dishes */}
        <section className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Popular Dishes</h2>
            <Link href="/menu" className="text-sm text-gray-500 flex items-center">
              View all
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {isLoadingPopular ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
          ) : popularDishes.length > 0 ? (
            <div className="space-y-4">
              {popularDishes.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 items-center bg-white p-2 rounded-lg shadow-md relative cursor-pointer"
                  onClick={() => router.push(`/food/${item.id}`)}
                >
                  <div className="relative h-20 w-20 flex-shrink-0">
                    <Image
                      src={item.image || "/placeholder.svg?height=80&width=80"}
                      alt={item.name}
                      fill
                      className="object-cover rounded-md"
                      sizes="80px"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-xs text-gray-500">{item.description}</p>
                    <p className="text-red-600 font-bold">
                      {item.minPrice && item.maxPrice
                        ? `GHC ${item.minPrice} - GHC ${item.maxPrice}`
                        : `GHC ${item.price}`}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(item.id)
                      }}
                    >
                      <Heart className={`h-5 w-5 ${favorites.includes(item.id) ? "fill-red-600 text-red-600" : ""}`} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full border-red-600 text-red-600"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/food/${item.id}`)
                      }}
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center h-24 bg-gray-100 rounded-xl">
              <p className="text-gray-500">No popular dishes available</p>
            </div>
          )}
        </section>
      </div>

      <BottomNav active="home" />
    </main>
  )
}


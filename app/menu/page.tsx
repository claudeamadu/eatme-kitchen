"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Heart, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BottomNav } from "@/components/bottom-nav"
import { Badge } from "@/components/ui/badge"
import { db } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"

// Food category interface
interface FoodCategory {
  id: string
  name: string
}

// Food item interface
interface FoodItem {
  id: string
  name: string
  description: string
  image: string
  priceRange: string
  category: string
  isNew?: boolean
}

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [favorites, setFavorites] = useState<string[]>([])
  const [categories, setCategories] = useState<FoodCategory[]>([])
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Fetch categories and food items from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch categories
        const categoriesSnapshot = await getDocs(collection(db, "foodCategories"))
        const categoriesData: FoodCategory[] = [{ id: "all", name: "All" }]

        categoriesSnapshot.forEach((doc) => {
          categoriesData.push({ id: doc.id, ...doc.data() } as FoodCategory)
        })

        setCategories(categoriesData)

        // Fetch food items
        const foodSnapshot = await getDocs(collection(db, "foodItems"))
        const foodData: FoodItem[] = []

        foodSnapshot.forEach((doc) => {
          foodData.push({ id: doc.id, ...doc.data() } as FoodItem)
        })

        setFoodItems(foodData)
      } catch (error) {
        console.error("Error fetching data:", error)
        // If there's an error, use fallback data
        setCategories([
          { id: "all", name: "All" },
          { id: "assorted", name: "Assorted" },
          { id: "seafood", name: "Sea Food" },
          { id: "fried", name: "Fried Rice" },
          { id: "noodles", name: "Noodles" },
          { id: "chicken", name: "Chicken" },
          { id: "beef", name: "Beef" },
        ])

        setFoodItems([
          {
            id: "1",
            name: "Assorted Jollof",
            description: "Freshly made Jollof rice with vegetables, chicken...",
            image: "/images/food/assorted-jollof.jpg",
            priceRange: "GHC 50 - GHC 120",
            category: "assorted",
          },
          {
            id: "2",
            name: "Assorted Fried Rice",
            description: "Freshly made fried rice with vegetables, chicken...",
            image: "/images/food/fried-rice.jpg",
            priceRange: "GHC 50 - GHC 120",
            category: "fried",
          },
          // More fallback items...
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter food items based on active category and search query
  const filteredItems = foodItems.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter((favId) => favId !== id))
    } else {
      setFavorites([...favorites, id])
    }
  }

  return (
    <main className="flex min-h-screen flex-col pb-16">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image src="/images/background.png" alt="Background pattern" fill className="object-cover" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-4">
        <h1 className="text-xl font-bold mb-4">Menu</h1>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="search food, eg. noodles"
            className="pl-10 py-5 rounded-full bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      {/* Categories */}
      <section className="relative z-10 mt-2 px-4">
        <h2 className="text-sm font-medium mb-2">Category</h2>
        {loading ? (
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-9 w-24 rounded-full" />
            ))}
          </div>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                className={`rounded-full px-4 py-1 ${
                  activeCategory === category.id ? "bg-red-600 hover:bg-red-700" : "bg-white"
                }`}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        )}
      </section>

      {/* Food Items */}
      <section className="relative z-10 px-4 mt-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3 items-center bg-white p-2 rounded-lg shadow-md">
                <Skeleton className="h-20 w-20 rounded-md" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-full mb-2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 items-center bg-white p-2 rounded-lg shadow-md relative cursor-pointer"
                onClick={() => router.push(`/food/${item.id}`)}
              >
                <div className="relative h-20 w-20 flex-shrink-0">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    fill
                    className="object-cover rounded-md"
                  />
                  {item.isNew && <Badge className="absolute top-0 left-0 bg-red-600 text-white text-xs">New</Badge>}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-xs text-gray-500">{item.description}</p>
                  <p className="text-red-600 font-bold">{item.priceRange}</p>
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
        )}
      </section>

      <BottomNav active="menu" />
    </main>
  )
}


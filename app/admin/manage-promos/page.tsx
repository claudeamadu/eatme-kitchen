"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronLeft, Plus, Trash, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "@/hooks/use-toast"

interface Promo {
  id: string
  title: string
  description: string
  image: string
  buttonText: string
  actionUrl: string
  bgColor: string
  textColor: string
  order: number
}

interface FoodItem {
  id: string
  name: string
  description: string
  image: string
  price: number
  category: string
  isDailySpecial: boolean
}

export default function ManagePromosPage() {
  const router = useRouter()
  const [promos, setPromos] = useState<Promo[]>([])
  const [foods, setFoods] = useState<FoodItem[]>([])
  const [isLoadingPromos, setIsLoadingPromos] = useState(true)
  const [isLoadingFoods, setIsLoadingFoods] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showAddPromo, setShowAddPromo] = useState(false)

  // New promo form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [buttonText, setButtonText] = useState("Order Now")
  const [actionUrl, setActionUrl] = useState("/menu")
  const [bgColor, setBgColor] = useState("bg-gray-100")
  const [textColor, setTextColor] = useState("text-gray-600")
  const [promoImage, setPromoImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
        toast({
          title: "Error",
          description: "Failed to load promotions",
          variant: "destructive",
        })
      } finally {
        setIsLoadingPromos(false)
      }
    }

    fetchPromos()
  }, [])

  // Fetch foods from Firestore
  useEffect(() => {
    const fetchFoods = async () => {
      setIsLoadingFoods(true)
      try {
        const foodsRef = collection(db, "foods")
        const foodsSnapshot = await getDocs(foodsRef)

        const foodsData = foodsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          isDailySpecial: doc.data().isDailySpecial || false,
        })) as FoodItem[]

        setFoods(foodsData)
      } catch (error) {
        console.error("Error fetching foods:", error)
        toast({
          title: "Error",
          description: "Failed to load food items",
          variant: "destructive",
        })
      } finally {
        setIsLoadingFoods(false)
      }
    }

    fetchFoods()
  }, [])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Create a local URL for the image
    const imageUrl = URL.createObjectURL(file)
    setPromoImage(imageUrl)
  }

  const handleAddPromo = async () => {
    if (!title || !description || !buttonText || !actionUrl || !promoImage) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const newPromoId = Date.now().toString()
      const newPromo: Promo = {
        id: newPromoId,
        title,
        description,
        image: promoImage,
        buttonText,
        actionUrl,
        bgColor,
        textColor,
        order: promos.length + 1,
      }

      // Add to Firestore
      await setDoc(doc(db, "promos", newPromoId), newPromo)

      // Update local state
      setPromos([...promos, newPromo])

      // Reset form
      setTitle("")
      setDescription("")
      setButtonText("Order Now")
      setActionUrl("/menu")
      setBgColor("bg-gray-100")
      setTextColor("text-gray-600")
      setPromoImage(null)
      setShowAddPromo(false)

      toast({
        title: "Success",
        description: "Promotion added successfully",
      })
    } catch (error) {
      console.error("Error adding promo:", error)
      toast({
        title: "Error",
        description: "Failed to add promotion",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeletePromo = async (id: string) => {
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, "promos", id))

      // Update local state
      setPromos(promos.filter((promo) => promo.id !== id))

      toast({
        title: "Success",
        description: "Promotion deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting promo:", error)
      toast({
        title: "Error",
        description: "Failed to delete promotion",
        variant: "destructive",
      })
    }
  }

  const handleToggleDailySpecial = async (foodId: string, isSpecial: boolean) => {
    // Count current daily specials
    const currentSpecialsCount = foods.filter((food) => food.isDailySpecial).length

    // If trying to add a new special and already have 2, show error
    if (isSpecial && currentSpecialsCount >= 2 && !foods.find((f) => f.id === foodId)?.isDailySpecial) {
      toast({
        title: "Limit reached",
        description: "You can only have 2 daily specials at a time",
        variant: "destructive",
      })
      return
    }

    try {
      // Update in Firestore
      await setDoc(doc(db, "foods", foodId), { isDailySpecial: isSpecial }, { merge: true })

      // Update local state
      setFoods(foods.map((food) => (food.id === foodId ? { ...food, isDailySpecial: isSpecial } : food)))

      toast({
        title: "Success",
        description: `Food ${isSpecial ? "added to" : "removed from"} daily specials`,
      })
    } catch (error) {
      console.error("Error updating daily special:", error)
      toast({
        title: "Error",
        description: "Failed to update daily special",
        variant: "destructive",
      })
    }
  }

  const bgColorOptions = [
    { value: "bg-gray-100", label: "Light Gray" },
    { value: "bg-gradient-to-r from-orange-500 to-red-500", label: "Orange to Red" },
    { value: "bg-gradient-to-r from-blue-500 to-purple-500", label: "Blue to Purple" },
    { value: "bg-gradient-to-r from-green-500 to-teal-500", label: "Green to Teal" },
    { value: "bg-gradient-to-r from-pink-500 to-rose-500", label: "Pink to Rose" },
  ]

  const textColorOptions = [
    { value: "text-gray-600", label: "Dark Gray" },
    { value: "text-white", label: "White" },
  ]

  return (
    <main className="flex min-h-screen flex-col pb-16 bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white p-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center">
          <Button variant="outline" size="icon" className="mr-2 rounded-full" onClick={() => router.back()}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Manage Promotions & Specials</h1>
        </div>
      </header>

      <div className="flex-1 p-4 space-y-6">
        {/* Promotions Section */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Promotions</h2>
            <Button
              onClick={() => setShowAddPromo(!showAddPromo)}
              variant="outline"
              className="flex items-center gap-1"
            >
              {showAddPromo ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showAddPromo ? "Cancel" : "Add Promo"}
            </Button>
          </div>

          {isLoadingPromos ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 text-red-600 animate-spin" />
            </div>
          ) : (
            <>
              {/* Add Promo Form */}
              {showAddPromo && (
                <Card className="p-4 mb-6">
                  <h3 className="font-medium mb-4">Add New Promotion</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="promo-title">Title</Label>
                      <Input
                        id="promo-title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Weekend Special Offer!"
                      />
                    </div>

                    <div>
                      <Label htmlFor="promo-description">Description</Label>
                      <Textarea
                        id="promo-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g. Get 20% off on all orders above GHC 100 this weekend!"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="button-text">Button Text</Label>
                        <Input
                          id="button-text"
                          value={buttonText}
                          onChange={(e) => setButtonText(e.target.value)}
                          placeholder="e.g. Order Now"
                        />
                      </div>

                      <div>
                        <Label htmlFor="action-url">Action URL</Label>
                        <Input
                          id="action-url"
                          value={actionUrl}
                          onChange={(e) => setActionUrl(e.target.value)}
                          placeholder="e.g. /menu"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="bg-color">Background Color</Label>
                        <Select value={bgColor} onValueChange={setBgColor}>
                          <SelectTrigger id="bg-color">
                            <SelectValue placeholder="Select background color" />
                          </SelectTrigger>
                          <SelectContent>
                            {bgColorOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="text-color">Text Color</Label>
                        <Select value={textColor} onValueChange={setTextColor}>
                          <SelectTrigger id="text-color">
                            <SelectValue placeholder="Select text color" />
                          </SelectTrigger>
                          <SelectContent>
                            {textColorOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="promo-image">Promo Image</Label>
                      <div className="flex items-center gap-4 mt-2">
                        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                          Upload Image
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          id="promo-image"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                        {promoImage && (
                          <div className="relative h-16 w-16 rounded-full overflow-hidden">
                            <Image
                              src={promoImage || "/placeholder.svg"}
                              alt="Promo preview"
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={handleAddPromo}
                        disabled={isSaving || !title || !description || !buttonText || !actionUrl || !promoImage}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Add Promotion"
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Existing Promos */}
              {promos.length > 0 ? (
                <div className="space-y-4">
                  {promos.map((promo) => (
                    <Card key={promo.id} className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="relative h-16 w-16 rounded-full overflow-hidden flex-shrink-0">
                          <Image
                            src={promo.image || "/placeholder.svg?height=64&width=64"}
                            alt={promo.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{promo.title}</h3>
                          <p className="text-sm text-gray-500">{promo.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{promo.buttonText}</span>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{promo.actionUrl}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600"
                          onClick={() => handleDeletePromo(promo.id)}
                        >
                          <Trash className="h-5 w-5" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex justify-center items-center h-24 bg-gray-100 rounded-xl">
                  <p className="text-gray-500">No promotions available</p>
                </div>
              )}
            </>
          )}
        </section>

        <Separator />

        {/* Daily Specials Section */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Daily Specials</h2>
          <p className="text-sm text-gray-500 mb-4">
            Select up to 2 food items to feature as daily specials on the home page.
          </p>

          {isLoadingFoods ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 text-red-600 animate-spin" />
            </div>
          ) : foods.length > 0 ? (
            <div className="space-y-4">
              {foods.map((food) => (
                <Card key={food.id} className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={food.image || "/placeholder.svg?height=64&width=64"}
                        alt={food.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{food.name}</h3>
                      <p className="text-sm text-gray-500 line-clamp-1">{food.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">GHC {food.price}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{food.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Checkbox
                        id={`special-${food.id}`}
                        checked={food.isDailySpecial}
                        onCheckedChange={(checked) => {
                          handleToggleDailySpecial(food.id, checked === true)
                        }}
                      />
                      <Label htmlFor={`special-${food.id}`} className="ml-2">
                        Daily Special
                      </Label>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center h-24 bg-gray-100 rounded-xl">
              <p className="text-gray-500">No food items available</p>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}


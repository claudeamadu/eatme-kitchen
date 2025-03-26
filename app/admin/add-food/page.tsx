"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { db } from "@/lib/firebase"
import { collection, addDoc, getDocs } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash, Plus, ImageIcon, Loader2 } from "lucide-react"
import { AlertDialog } from "@/components/alert-dialog"

interface Size {
  id: string
  name: string
  price: number
}

interface Extra {
  id: string
  name: string
  price: number
  image: string
}

interface Category {
  id: string
  name: string
}

export default function AddFoodPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [prepTime, setPrepTime] = useState("")
  const [category, setCategory] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [sizes, setSizes] = useState<Size[]>([
    { id: "small", name: "Small", price: 0 },
    { id: "medium", name: "Medium", price: 0 },
    { id: "large", name: "Large", price: 0 },
  ])
  const [extras, setExtras] = useState<Extra[]>([])
  const [isNew, setIsNew] = useState(false)
  const [rating, setRating] = useState(4.5)
  const [reviews, setReviews] = useState(0)

  const [mainImage, setMainImage] = useState<File | null>(null)
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null)

  const [loading, setLoading] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const extraFileInputRef = useRef<HTMLInputElement>(null)
  const [currentExtraIndex, setCurrentExtraIndex] = useState(-1)

  // Fetch categories on component mount
  useState(() => {
    const fetchCategories = async () => {
      try {
        const categoriesSnapshot = await getDocs(collection(db, "foodCategories"))
        const categoriesData: Category[] = []

        categoriesSnapshot.forEach((doc) => {
          categoriesData.push({ id: doc.id, ...doc.data() } as Category)
        })

        setCategories(categoriesData)
      } catch (error) {
        console.error("Error fetching categories:", error)
        // Fallback categories
        setCategories([
          { id: "assorted", name: "Assorted" },
          { id: "seafood", name: "Sea Food" },
          { id: "fried", name: "Fried Rice" },
          { id: "noodles", name: "Noodles" },
          { id: "chicken", name: "Chicken" },
          { id: "beef", name: "Beef" },
        ])
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setMainImage(file)
      setMainImagePreview(URL.createObjectURL(file))
    }
  }

  const handleExtraImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && currentExtraIndex >= 0) {
      const file = e.target.files[0]

      // Create a local URL for preview
      const imageUrl = URL.createObjectURL(file)

      // Update the extras array with the local image URL
      const updatedExtras = [...extras]
      updatedExtras[currentExtraIndex] = {
        ...updatedExtras[currentExtraIndex],
        image: imageUrl,
      }
      setExtras(updatedExtras)
    }
  }

  const handleSizeChange = (index: number, field: keyof Size, value: string | number) => {
    const updatedSizes = [...sizes]
    updatedSizes[index] = {
      ...updatedSizes[index],
      [field]: field === "price" ? Number(value) : value,
    }
    setSizes(updatedSizes)
  }

  const handleExtraChange = (index: number, field: keyof Extra, value: string | number) => {
    const updatedExtras = [...extras]
    updatedExtras[index] = {
      ...updatedExtras[index],
      [field]: field === "price" ? Number(value) : value,
    }
    setExtras(updatedExtras)
  }

  const addExtra = () => {
    setExtras([...extras, { id: `extra-${extras.length + 1}`, name: "", price: 0, image: "/placeholder.svg" }])
  }

  const removeExtra = (index: number) => {
    const updatedExtras = [...extras]
    updatedExtras.splice(index, 1)
    setExtras(updatedExtras)
  }

  const openExtraImageUpload = (index: number) => {
    setCurrentExtraIndex(index)
    if (extraFileInputRef.current) {
      extraFileInputRef.current.click()
    }
  }

  const calculatePriceRange = () => {
    if (sizes.length === 0) return "GHC 0"

    const prices = sizes.map((size) => size.price).filter((price) => price > 0)
    if (prices.length === 0) return "GHC 0"

    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)

    return minPrice === maxPrice ? `GHC ${minPrice}` : `GHC ${minPrice} - GHC ${maxPrice}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !description || !category || !mainImage) {
      alert("Please fill in all required fields and upload a main image")
      return
    }

    try {
      setLoading(true)

      // Use the local image URL directly
      const imageUrl = mainImagePreview || "/placeholder.svg"

      // Create food item object
      const foodItem = {
        name,
        description,
        image: imageUrl,
        category,
        priceRange: calculatePriceRange(),
        prepTime,
        sizes,
        extras,
        rating,
        reviews,
        isNew,
        createdAt: new Date(),
      }

      // Add to Firestore
      await addDoc(collection(db, "foodItems"), foodItem)

      // Show success dialog
      setShowSuccessDialog(true)
    } catch (error) {
      console.error("Error adding food item:", error)
      alert("Failed to add food item. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleAddAnother = () => {
    setShowSuccessDialog(false)

    // Reset form
    setName("")
    setDescription("")
    setPrepTime("")
    setCategory("")
    setSizes([
      { id: "small", name: "Small", price: 0 },
      { id: "medium", name: "Medium", price: 0 },
      { id: "large", name: "Large", price: 0 },
    ])
    setExtras([])
    setIsNew(false)
    setRating(4.5)
    setReviews(0)
    setMainImage(null)
    setMainImagePreview(null)
  }

  const handleGoToMenu = () => {
    setShowSuccessDialog(false)
    router.push("/menu")
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Add New Food Item</CardTitle>
          <CardDescription>Fill in the details to add a new food item to the menu</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Food Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Assorted Jollof Rice"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the food item..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="prepTime">Preparation Time</Label>
                <Input
                  id="prepTime"
                  value={prepTime}
                  onChange={(e) => setPrepTime(e.target.value)}
                  placeholder="e.g. 30 min"
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="isNew">Mark as New</Label>
                <input
                  type="checkbox"
                  id="isNew"
                  checked={isNew}
                  onChange={(e) => setIsNew(e.target.checked)}
                  className="h-4 w-4"
                />
              </div>

              <div>
                <Label>Main Image *</Label>
                <div
                  className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {mainImagePreview ? (
                    <div className="relative w-full h-48">
                      <img
                        src={mainImagePreview || "/placeholder.svg"}
                        alt="Food preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">Click to upload main food image</p>
                    </>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleMainImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>

              <div>
                <Label>Sizes</Label>
                <div className="space-y-2 mt-1">
                  {sizes.map((size, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={size.name}
                        onChange={(e) => handleSizeChange(index, "name", e.target.value)}
                        placeholder="Size name"
                      />
                      <Input
                        type="number"
                        value={size.price}
                        onChange={(e) => handleSizeChange(index, "price", e.target.value)}
                        placeholder="Price"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <Label>Extras</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addExtra}>
                    <Plus className="h-4 w-4 mr-1" /> Add Extra
                  </Button>
                </div>
                <div className="space-y-4 mt-2">
                  {extras.map((extra, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex justify-between mb-2">
                        <h4 className="text-sm font-medium">Extra {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExtra(index)}
                          className="h-8 w-8 p-0 text-red-500"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Input
                          value={extra.name}
                          onChange={(e) => handleExtraChange(index, "name", e.target.value)}
                          placeholder="Extra name"
                        />
                        <Input
                          type="number"
                          value={extra.price}
                          onChange={(e) => handleExtraChange(index, "price", e.target.value)}
                          placeholder="Price"
                          min="0"
                          step="0.01"
                        />
                        <div
                          className="border rounded-lg p-2 flex items-center justify-center cursor-pointer"
                          onClick={() => openExtraImageUpload(index)}
                        >
                          {extra.image ? (
                            <div className="relative w-16 h-16">
                              <img
                                src={extra.image || "/placeholder.svg"}
                                alt={extra.name}
                                className="w-full h-full object-cover rounded-md"
                              />
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <ImageIcon className="h-8 w-8 text-gray-400" />
                              <span className="text-xs text-gray-500">Add image</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <input
                  type="file"
                  ref={extraFileInputRef}
                  onChange={handleExtraImageChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rating">Rating</Label>
                  <Input
                    id="rating"
                    type="number"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    min="0"
                    max="5"
                    step="0.1"
                  />
                </div>
                <div>
                  <Label htmlFor="reviews">Number of Reviews</Label>
                  <Input
                    id="reviews"
                    type="number"
                    value={reviews}
                    onChange={(e) => setReviews(Number(e.target.value))}
                    min="0"
                  />
                </div>
              </div>
            </div>

            <CardFooter className="px-0 pt-4">
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding Food Item...
                  </>
                ) : (
                  "Add Food Item"
                )}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <AlertDialog
        isOpen={showSuccessDialog}
        title="Food Item Added"
        message="The food item has been successfully added to the menu."
        confirmText="Add Another"
        cancelText="Go to Menu"
        onConfirm={handleAddAnother}
        onCancel={handleGoToMenu}
      />
    </div>
  )
}


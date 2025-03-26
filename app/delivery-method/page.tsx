"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Search, MapPin, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { OrderSummaryDialog } from "@/components/order-summary-dialog"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"

// Set Mapbox access token
mapboxgl.accessToken = "pk.eyJ1Ijoib2JpcmljbGF1ZGUiLCJhIjoiY20zMmFvOXAyMTM1cDJtcjM3MXJ6ZG95YSJ9.7bdxPWc-_uloyv1UwJryEw"

export default function DeliveryMethodPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery")
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [additionalInfo, setAdditionalInfo] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [showOrderSummary, setShowOrderSummary] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationName, setLocationName] = useState("")
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const mapRef = useRef<HTMLDivElement>(null)
  const mapboxMapRef = useRef<mapboxgl.Map | null>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)

  // Check if user is logged in and fetch saved address
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserId(user.uid)
        await fetchSavedAddress(user.uid)
      } else {
        router.push("/auth/login")
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  // Fetch saved address from user document
  const fetchSavedAddress = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid))
      if (userDoc.exists()) {
        const userData = userDoc.data()
        if (userData.deliveryAddress) {
          setDeliveryAddress(userData.deliveryAddress)
          setLocationName(userData.deliveryAddress)

          // If there are saved coordinates, set them
          if (userData.deliveryCoordinates) {
            const coords = userData.deliveryCoordinates
            setSelectedLocation({ lng: coords.lng, lat: coords.lat })
          }
        }
      }
    } catch (error) {
      console.error("Error fetching saved address:", error)
    }
  }

  // Save address to user document
  const saveAddressToUser = async () => {
    if (!userId || !deliveryAddress) return

    try {
      const userRef = doc(db, "users", userId)
      const updateData: any = {
        deliveryAddress: deliveryAddress,
      }

      // Add coordinates if available
      if (selectedLocation) {
        updateData.deliveryCoordinates = selectedLocation
      }

      await updateDoc(userRef, updateData)
      toast({
        title: "Address Saved",
        description: "Your delivery address has been saved to your profile",
      })
    } catch (error) {
      console.error("Error saving address:", error)
      toast({
        title: "Error",
        description: "Failed to save your address. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Initialize map when component mounts and delivery method is 'delivery'
  useEffect(() => {
    if (deliveryMethod === "delivery" && mapRef.current && !mapboxMapRef.current) {
      // Default to Accra, Ghana if no location
      const defaultLocation = selectedLocation || { lng: -0.187, lat: 5.6037 }

      // Create map
      const map = new mapboxgl.Map({
        container: mapRef.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [defaultLocation.lng, defaultLocation.lat],
        zoom: 13,
      })

      mapboxMapRef.current = map

      // Create marker
      const marker = new mapboxgl.Marker({
        color: "#b91c1c", // Red color to match design
        draggable: true,
      })
        .setLngLat([defaultLocation.lng, defaultLocation.lat])
        .addTo(map)

      markerRef.current = marker

      // Add click listener to map
      map.on("click", (e) => {
        const clickedLocation = { lng: e.lngLat.lng, lat: e.lngLat.lat }
        setSelectedLocation(clickedLocation)
        marker.setLngLat([clickedLocation.lng, clickedLocation.lat])

        // Get address from coordinates (reverse geocoding)
        fetchLocationName(clickedLocation.lng, clickedLocation.lat)
      })

      // Add drag end listener to marker
      marker.on("dragend", () => {
        const lngLat = marker.getLngLat()
        const draggedLocation = { lng: lngLat.lng, lat: lngLat.lat }
        setSelectedLocation(draggedLocation)

        // Get address from coordinates (reverse geocoding)
        fetchLocationName(draggedLocation.lng, draggedLocation.lat)
      })

      // Try to get user's current location if no saved location
      if (!selectedLocation && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLocation = {
              lng: position.coords.longitude,
              lat: position.coords.latitude,
            }
            setCurrentLocation(userLocation)
            setSelectedLocation(userLocation)

            // Update map and marker
            map.flyTo({ center: [userLocation.lng, userLocation.lat] })
            marker.setLngLat([userLocation.lng, userLocation.lat])

            // Get address from coordinates (reverse geocoding)
            fetchLocationName(userLocation.lng, userLocation.lat)
          },
          (error) => {
            console.error("Error getting current location:", error)
          },
        )
      }

      setMapLoaded(true)
    }

    return () => {
      if (mapboxMapRef.current) {
        mapboxMapRef.current.remove()
        mapboxMapRef.current = null
      }
    }
  }, [deliveryMethod, selectedLocation])

  // Fetch location name from coordinates using Mapbox Geocoding API
  const fetchLocationName = async (lng: number, lat: number) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`,
      )
      const data = await response.json()

      if (data.features && data.features.length > 0) {
        const address = data.features[0].place_name
        setDeliveryAddress(address)
        setLocationName(address)
      }
    } catch (error) {
      console.error("Error fetching location name:", error)
    }
  }

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery) return

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${mapboxgl.accessToken}`,
      )
      const data = await response.json()

      if (data.features && data.features.length > 0) {
        const location = data.features[0]
        const coordinates = location.center
        const searchedLocation = { lng: coordinates[0], lat: coordinates[1] }

        setSelectedLocation(searchedLocation)
        setDeliveryAddress(location.place_name)
        setLocationName(location.place_name)

        // Update map and marker
        if (mapboxMapRef.current && markerRef.current) {
          mapboxMapRef.current.flyTo({ center: coordinates })
          markerRef.current.setLngLat(coordinates)
        }
      } else {
        toast({
          title: "Location Not Found",
          description: "Please try a different search term",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error searching for location:", error)
      toast({
        title: "Search Error",
        description: "Failed to search for location. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Use current location
  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lng: position.coords.longitude,
            lat: position.coords.latitude,
          }
          setCurrentLocation(userLocation)
          setSelectedLocation(userLocation)

          // Update map and marker
          if (mapboxMapRef.current && markerRef.current) {
            mapboxMapRef.current.flyTo({ center: [userLocation.lng, userLocation.lat] })
            markerRef.current.setLngLat([userLocation.lng, userLocation.lat])

            // Get address from coordinates (reverse geocoding)
            fetchLocationName(userLocation.lng, userLocation.lat)
          }
        },
        (error) => {
          console.error("Error getting current location:", error)
          toast({
            title: "Location Error",
            description: "Could not get your current location. Please try again or enter your address manually.",
            variant: "destructive",
          })
        },
      )
    } else {
      toast({
        title: "Not Supported",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive",
      })
    }
  }

  const handleContinue = () => {
    if (deliveryMethod === "delivery" && !deliveryAddress) {
      toast({
        title: "Address Required",
        description: "Please enter a delivery address",
        variant: "destructive",
      })
      return
    }

    // Save address to user profile
    if (deliveryMethod === "delivery") {
      saveAddressToUser()
    }

    // Get checkout data from session storage
    const checkoutDataStr = sessionStorage.getItem("checkoutData")
    if (checkoutDataStr) {
      const checkoutData = JSON.parse(checkoutDataStr)

      // Update with delivery information
      const updatedCheckoutData = {
        ...checkoutData,
        deliveryMethod,
        deliveryAddress: deliveryMethod === "delivery" ? deliveryAddress : "EatMe Kitchen, Accra Mall",
        additionalInfo,
        deliveryFee: deliveryMethod === "delivery" ? 20 : 0, // No delivery fee for pickup
        deliveryCoordinates: selectedLocation,
      }

      // Save updated checkout data
      sessionStorage.setItem("checkoutData", JSON.stringify(updatedCheckoutData))
    }

    setShowOrderSummary(true)
  }

  const handleConfirmOrder = () => {
    router.push("/payment")
  }

  const clearSearch = () => {
    setSearchQuery("")
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-red-600 rounded-full border-t-transparent"></div>
      </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col bg-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white p-4 shadow-sm flex items-center">
        <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Delivery Method</h1>
      </header>

      {/* Delivery Method Selector */}
      <div className="p-4">
        <div className="flex rounded-full overflow-hidden shadow-md">
          <Button
            className={`flex-1 rounded-none py-6 text-lg ${
              deliveryMethod === "delivery"
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-white hover:bg-gray-100 text-gray-800"
            }`}
            onClick={() => setDeliveryMethod("delivery")}
          >
            Delivery
          </Button>
          <Button
            className={`flex-1 rounded-none py-6 text-lg ${
              deliveryMethod === "pickup"
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-white hover:bg-gray-100 text-gray-800"
            }`}
            onClick={() => setDeliveryMethod("pickup")}
          >
            Pick up
          </Button>
        </div>
      </div>

      {/* Map (only shown for delivery) */}
      {deliveryMethod === "delivery" && (
        <div className="relative h-[400px] w-full">
          <div ref={mapRef} className="h-full w-full" />

          {/* Search overlay */}
          <div className="absolute top-4 left-4 right-4 z-10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search current location"
                className="pl-10 pr-10 py-5 rounded-full bg-white shadow-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                  onClick={clearSearch}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Current location button */}
          <div className="absolute bottom-4 left-4 z-10 flex items-center">
            <Button
              variant="outline"
              className="bg-white shadow-md flex items-center gap-1"
              onClick={useCurrentLocation}
            >
              <MapPin className="h-4 w-4 text-red-600" />
              <span>Your Current Location</span>
            </Button>
          </div>

          {/* Location info */}
          <div className="absolute bottom-4 left-0 right-0 z-10 px-4 text-center">
            <p className="text-gray-600 text-sm">Where would you like your order to be delivered to?</p>
          </div>
        </div>
      )}

      {/* Delivery Details */}
      <div className="flex-1 p-4">
        {deliveryMethod === "delivery" && (
          <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
            <div className="flex items-start gap-2 mb-3">
              <MapPin className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium">Delivery Location</h3>
                <p className="text-sm text-gray-500">{locationName || "Select a location on the map"}</p>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <div>
                <Label htmlFor="address">Delivery Address</Label>
                <Textarea
                  id="address"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter your full delivery address"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
                <Textarea
                  id="additionalInfo"
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  placeholder="Apartment number, landmark, delivery instructions..."
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        )}

        {deliveryMethod === "pickup" && (
          <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
            <div className="flex items-start gap-2 mb-3">
              <MapPin className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium">Pickup Location</h3>
                <p className="text-sm text-gray-500">EatMe Kitchen, Accra Mall</p>
              </div>
            </div>

            <Separator className="my-4" />

            <div>
              <p className="text-sm text-gray-600">
                Your order will be ready for pickup in approximately 30 minutes. Please bring your order confirmation.
              </p>
            </div>
          </div>
        )}

        <Button
          className="w-full bg-red-600 hover:bg-red-700 py-6 text-lg rounded-full"
          onClick={handleContinue}
          disabled={deliveryMethod === "delivery" && !deliveryAddress}
        >
          {deliveryMethod === "delivery" ? "Confirm Location" : "Confirm Pickup"}
        </Button>
      </div>

      {/* Order Summary Dialog */}
      <OrderSummaryDialog
        isOpen={showOrderSummary}
        onClose={() => setShowOrderSummary(false)}
        onConfirm={handleConfirmOrder}
        deliveryMethod={deliveryMethod}
        deliveryAddress={deliveryAddress}
        additionalInfo={additionalInfo}
      />
    </main>
  )
}


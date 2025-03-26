"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronLeft, Pencil, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BottomNav } from "@/components/bottom-nav"
import { LogoutDialog } from "@/components/logout-dialog"
import { useAuth } from "@/components/auth-provider"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [username, setUsername] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [photoURL, setPhotoURL] = useState("/images/profile/avatar.jpg")
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid))

        if (userDoc.exists()) {
          const data = userDoc.data()
          setUsername(data.displayName || user.displayName || "")
          setPhoneNumber(data.phoneNumber || user.phoneNumber || "")
          setDateOfBirth(data.dateOfBirth || "")
          setPhotoURL(data.photoURL || user.photoURL || "/images/profile/avatar.jpg")
        } else {
          // Use Firebase Auth data if no Firestore data
          setUsername(user.displayName || "")
          setPhoneNumber(user.phoneNumber || "")
          setPhotoURL(user.photoURL || "/images/profile/avatar.jpg")
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        toast({
          title: "Error loading profile",
          description: "Could not load your profile data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [user])

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setIsLoading(true)
    try {
      // Create a local URL for the image instead of uploading to Firebase Storage
      const localImageUrl = URL.createObjectURL(file)

      // Update state with local image URL
      setPhotoURL(localImageUrl)

      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated locally.",
      })
    } catch (error) {
      console.error("Error handling profile picture:", error)
      toast({
        title: "Update failed",
        description: "Could not update your profile picture. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      // Update Firestore document
      const userRef = doc(db, "users", user.uid)
      const userDoc = await getDoc(userRef)

      if (userDoc.exists()) {
        await updateDoc(userRef, {
          displayName: username,
          phoneNumber: phoneNumber,
          dateOfBirth: dateOfBirth,
          photoURL: photoURL,
          updatedAt: new Date(),
        })
      } else {
        await setDoc(userRef, {
          displayName: username,
          phoneNumber: phoneNumber,
          dateOfBirth: dateOfBirth,
          photoURL: photoURL,
          email: user.email,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })

      router.push("/settings")
    } catch (error) {
      console.error("Error saving profile:", error)
      toast({
        title: "Save failed",
        description: "Could not save your profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = () => {
    setShowLogoutDialog(false)
    router.push("/auth/login")
  }

  return (
    <main className="flex min-h-screen flex-col pb-16">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image src="/images/background.png" alt="Background pattern" fill className="object-cover" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-4 flex items-center bg-white bg-opacity-90">
        <Button variant="outline" size="icon" className="mr-2 rounded-full bg-white" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Profile</h1>
      </header>

      {/* Profile Picture */}
      <section className="relative z-10 flex justify-center mt-4">
        <div className="relative">
          <div className="h-24 w-24 rounded-full overflow-hidden">
            <Image
              src={photoURL || "/placeholder.svg"}
              alt="Profile"
              width={96}
              height={96}
              className="object-cover"
              onError={(e) => {
                // Fallback if image fails to load
                const target = e.target as HTMLImageElement
                target.src = "/images/profile/avatar.jpg"
              }}
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white text-red-600"
            onClick={handleProfilePictureClick}
            disabled={isLoading}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
        </div>
      </section>

      {/* Profile Form */}
      <section className="relative z-10 px-4 mt-8 flex-1">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 text-red-600 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="py-6 px-4 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="py-6 px-4 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob">Date of birth</Label>
              <Input
                id="dob"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="py-6 px-4 rounded-xl"
              />
            </div>
          </div>
        )}
      </section>

      {/* Save Button */}
      <section className="relative z-10 px-4 py-6">
        <Button
          className="w-full bg-red-600 hover:bg-red-700 text-white py-6 rounded-full text-xl"
          onClick={handleSave}
          disabled={isLoading || isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save"
          )}
        </Button>
      </section>

      {/* Logout Dialog */}
      {showLogoutDialog && <LogoutDialog onClose={() => setShowLogoutDialog(false)} onConfirm={handleLogout} />}

      <BottomNav active="settings" />
    </main>
  )
}


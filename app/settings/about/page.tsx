"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronLeft, Globe, Mail, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { BottomNav } from "@/components/bottom-nav"

export default function AboutPage() {
  const router = useRouter()
  const appVersion = "1.0.0"

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
        <h1 className="text-xl font-bold">About</h1>
      </header>

      {/* App Info */}
      <section className="relative z-10 px-4 mt-4">
        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="flex flex-col items-center mb-6">
            <div className="relative h-24 w-24 mb-4">
              <Image src="/images/logo.png" alt="EatMe Kitchen Logo" fill className="object-contain" />
            </div>
            <h2 className="text-2xl font-bold">EatMe Kitchen</h2>
            <p className="text-gray-500">Version {appVersion}</p>
          </div>

          <p className="text-center text-gray-600 mb-6">
            EatMe Kitchen is your go-to food delivery app for delicious meals delivered right to your doorstep. We
            partner with the best restaurants to bring you a wide variety of cuisines.
          </p>

          <Separator className="my-6" />

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Contact Us</h3>

            <div className="flex items-center">
              <Phone className="h-5 w-5 text-gray-500 mr-3" />
              <span>+233 55 123 4567</span>
            </div>

            <div className="flex items-center">
              <Mail className="h-5 w-5 text-gray-500 mr-3" />
              <span>support@eatmekitchen.com</span>
            </div>

            <div className="flex items-center">
              <Globe className="h-5 w-5 text-gray-500 mr-3" />
              <span>www.eatmekitchen.com</span>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Follow Us</h3>

            <div className="flex justify-center space-x-6">
              <Button variant="ghost" size="icon" className="rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blue-600"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </Button>

              <Button variant="ghost" size="icon" className="rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-pink-600"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </Button>

              <Button variant="ghost" size="icon" className="rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blue-400"
                >
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                </svg>
              </Button>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="text-center text-gray-500 text-sm">
            <p>© 2024 EatMe Kitchen. All rights reserved.</p>
            <div className="flex justify-center mt-2 space-x-4">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
            </div>
          </div>
        </div>
      </section>

      <BottomNav active="settings" />
    </main>
  )
}


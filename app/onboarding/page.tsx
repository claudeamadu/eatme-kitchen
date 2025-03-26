"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)

  const onboardingSteps = [
    {
      image: "/images/onboard-1.jpg",
      title: "With Every Bite",
      description: "Savor the Burst of Flavor and Freshness.",
      alt: "Delicious food with vegetables",
    },
    {
      image: "/images/onboard-2.jpg",
      title: "Skip the Wait",
      description: "Enjoy Quick Service, Every Time.",
      alt: "Food delivery app on phone",
    },
    {
      image: "/images/onboard-3.jpg",
      title: "Exclusive Deals",
      description: "Special Rewards Just for Our Loyal App Users.",
      alt: "Exclusive restaurant deals",
    },
  ]

  const handleNext = () => {
    if (step < onboardingSteps.length - 1) {
      setStep(step + 1)
    } else {
      router.push("/auth/login") // Changed to go to login instead of signup
    }
  }

  const handleSkip = () => {
    router.push("/auth/login") // Changed to go to login instead of signup
  }

  const currentStep = onboardingSteps[step]

  return (
    <main className="flex min-h-screen flex-col relative">
      {/* Top image section */}
      <div className="relative h-[60vh]">
        <div className="absolute top-4 right-4 z-10">
          <Button variant="outline" className="bg-white rounded-full px-4" onClick={handleSkip}>
            Skip
          </Button>
        </div>
        <Image
          src={currentStep.image || "/placeholder.svg"}
          alt={currentStep.alt}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Bottom content section */}
      <div className="relative flex-1 rounded-t-3xl -mt-6 flex flex-col">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image src="/images/background.png" alt="Background pattern" fill className="object-cover" />
        </div>

        <div className="z-10 flex-1 flex flex-col p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{currentStep.title}</h2>
          <p className="text-lg text-gray-700 mb-auto">{currentStep.description}</p>

          {/* Pagination dots */}
          <div className="flex justify-center gap-2 my-6">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full ${index === step ? "w-8 bg-red-600" : "w-2 bg-gray-300"}`}
              />
            ))}
          </div>

          <Button
            className="w-full bg-red-600 hover:bg-red-700 text-white py-6 rounded-xl text-xl"
            onClick={handleNext}
          >
            {step === onboardingSteps.length - 1 ? "Get Started" : "Next"}
          </Button>
        </div>
      </div>
    </main>
  )
}


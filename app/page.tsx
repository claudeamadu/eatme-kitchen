"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"

export default function SplashScreen() {
  const router = useRouter()

  useEffect(() => {
    // Auto-navigate to onboarding after 2.5 seconds
    const timer = setTimeout(() => {
      router.push("/onboarding")
    }, 2500)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-white">
        <Image
          src="/images/background.png"
          alt="Background pattern"
          fill
          className="object-cover opacity-30"
          priority
          sizes="100vw"
        />
      </div>
      <div className="z-10 flex flex-col items-center justify-center">
        <motion.div
          className="w-72 h-72 relative"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            duration: 0.5,
          }}
        >
          <Image
            src="/images/splash-logo.png"
            alt="EatMe Kitchen Logo"
            fill
            className="object-contain"
            priority
            sizes="(max-width: 768px) 100vw, 288px"
          />
        </motion.div>
      </div>
    </main>
  )
}


"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"

export function useAuthRedirect(redirectTo: string, requireAuth = true) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        // User is not authenticated but authentication is required
        router.push(redirectTo)
      } else if (!requireAuth && user) {
        // User is authenticated but authentication is not required
        router.push(redirectTo)
      }
    }
  }, [user, loading, router, redirectTo, requireAuth])

  return { user, loading }
}


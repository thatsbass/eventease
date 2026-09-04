"use client"

import type { ReactNode } from "react"
import { useEffect } from "react"
import { Center, Spinner } from "@chakra-ui/react"
import { usePathname, useRouter } from "next/navigation"
import { EventsListSkeleton } from "@/features/events/components/events-list.skeleton"
import { useAuthHydrated } from "@/features/auth/hooks/use-auth-hydrated"
import { useAuthUser } from "@/features/auth/hooks/use-auth-user"

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const hydrated = useAuthHydrated()
  const { isAuthenticated } = useAuthUser()

  useEffect(() => {
    if (!hydrated) return
    if (!isAuthenticated) router.replace("/auth/login")
  }, [hydrated, isAuthenticated, router])

  if (!hydrated || !isAuthenticated) {
    // Keep the UI stable on first paint: show a skeleton for the main list page.
    if (pathname === "/events") {
      return <EventsListSkeleton />
    }

    return (
      <Center py={{ base: 10, md: 16 }}>
        <Spinner color="whiteAlpha.600" />
      </Center>
    )
  }

  return children
}

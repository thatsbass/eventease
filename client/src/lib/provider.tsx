"use client"

import { ChakraProvider } from "@chakra-ui/react"
import { QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "@/components/ui/toaster"
import { AuthBootstrap } from "@/features/auth/components/auth-bootstrap"
import { queryClient } from "./queryClient"
import { system } from "./theme"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider value={system}>
      <QueryClientProvider client={queryClient}>
        <AuthBootstrap />
        {children}
        <Toaster />
      </QueryClientProvider>
    </ChakraProvider>
  )
}
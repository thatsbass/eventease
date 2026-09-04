"use client"

import { Box } from "@chakra-ui/react"
import { LandingFeatures } from "./landing-features"
import { LandingHero } from "./landing-hero"
import { LANDING_VARS } from "./landing.constants"
import { LandingPricing } from "./landing-pricing"

export function LandingPageContent() {
  return (
    <Box as="main" minH="100vh" bg="var(--landing-bg)" color="var(--landing-text)" position="relative" overflow="hidden" style={LANDING_VARS}>
      <Box position="absolute" top="-140px" left="-80px" w={{ base: "280px", md: "460px" }} h={{ base: "280px", md: "460px" }} borderRadius="full" pointerEvents="none" />
      <Box position="absolute" bottom="-140px" right="-80px" w={{ base: "300px", md: "520px" }} h={{ base: "300px", md: "520px" }} borderRadius="full" bg="radial-gradient(circle, rgba(79,180,255,0.2) 0%, rgba(79,180,255,0) 72%)" pointerEvents="none" />
      <Box maxW="1200px" mx="auto" px={{ base: 4, md: 7 }} position="relative" zIndex={1}>
        <LandingHero />
        <LandingFeatures />
        <LandingPricing />
      </Box>
    </Box>
  )
}

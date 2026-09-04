import NextLink from "next/link"
import { Badge, Box, Button, Flex, Grid, HStack, Icon, Link, SimpleGrid, Stack, Text } from "@chakra-ui/react"
import { MdArrowOutward, MdCalendarMonth } from "react-icons/md"
import { floatCard, HERO_METRICS, PREVIEW_EVENTS, pulseDot, reveal } from "./landing.constants"

export function LandingHero() {
  return (
    <Grid templateColumns={{ base: "1fr", lg: "1.05fr 0.95fr" }} gap={{ base: 8, lg: 10 }} py={{ base: 6, md: 10 }} alignItems="center">
      <Stack gap={6} animation={reveal(90)}>
        <Badge w="fit-content" borderRadius="full" bg="var(--landing-accent-soft)" color="var(--landing-accent)" px={3} py={1.5} fontWeight="700" letterSpacing="0.02em">Plateforme publique pour organisateurs</Badge>
        <Text as="h1" fontFamily="var(--font-landing-heading), sans-serif" fontSize={{ base: "4xl", md: "6xl" }} lineHeight={{ base: "1.08", md: "1.02" }} letterSpacing="-0.03em" maxW="720px">Lancez des evenements qui <Box as="span" color="var(--landing-accent)"> vendent vite </Box>et se gerent sans friction.</Text>
        <Text maxW="640px" color="var(--landing-muted)" fontSize={{ base: "md", md: "lg" }}>EventEase centralise la vente, la communication et le check-in pour vos evenements publics, avec une interface claire pour votre equipe et vos invites.</Text>
        <HStack gap={3} flexWrap="wrap">
          <Link as={NextLink} href="/auth/login" _hover={{ textDecoration: "none" }}><Button bg="var(--landing-highlight)" color="white" borderRadius="full" h="46px" px={6} _hover={{ opacity: 0.92 }}>Demarrer gratuitement</Button></Link>
          <Link as={NextLink} href="/discover" _hover={{ textDecoration: "none" }}><Button variant="outline" borderRadius="full" h="46px" px={6} borderColor="var(--landing-border)" bg="var(--landing-surface)" color="white" _hover={{ bg: "var(--landing-surface-strong)" }}>Explorer les evenements</Button></Link>
        </HStack>
        <SimpleGrid columns={{ base: 1, sm: 3 }} gap={3} pt={1}>{HERO_METRICS.map((metric, index) => <Box key={metric.label} borderRadius="2xl" border="1px solid" borderColor="var(--landing-border)" bg="var(--landing-surface)" px={4} py={3.5} animation={reveal(170 + index * 80)}><Text fontFamily="var(--font-landing-heading), sans-serif" fontSize="2xl" lineHeight="1" letterSpacing="-0.02em">{metric.value}</Text><Text color="var(--landing-muted)" fontSize="xs" mt={1}>{metric.label}</Text></Box>)}</SimpleGrid>
      </Stack>
      <Stack gap={4} animation={reveal(230)}>
        <Box borderRadius="3xl" border="1px solid" borderColor="var(--landing-border)" bg="var(--landing-surface)" backdropFilter="blur(10px)" p={{ base: 4, md: 6 }} boxShadow="0 24px 50px rgba(0, 0, 0, 0.28)" animation={`${floatCard} 7s ease-in-out infinite`}>
          <HStack justify="space-between" mb={4}><Text fontWeight="700">Live Ops Board</Text><Badge bg="var(--landing-accent-soft)" color="var(--landing-accent)" borderRadius="full">Temps reel</Badge></HStack>
          <Stack gap={2.5}>{PREVIEW_EVENTS.map((event) => <Flex key={event.name} align="center" justify="space-between" borderRadius="xl" border="1px solid" borderColor="var(--landing-border)" bg="var(--landing-surface-strong)" px={3.5} py={3}><Stack gap={0}><Text fontWeight="600" fontSize="sm">{event.name}</Text><HStack gap={1.5} color="var(--landing-muted)" fontSize="xs"><Icon as={MdCalendarMonth} /><Text>{event.time}</Text></HStack></Stack><Text fontFamily="var(--font-landing-heading), sans-serif" color="var(--landing-accent)" fontWeight="700" fontSize="sm">{event.tickets}</Text></Flex>)}</Stack>
          <Flex mt={4} align="center" justify="space-between" borderRadius="xl" bg="rgba(136, 93, 246, 0.2)" px={3.5} py={3}><HStack gap={2}><Box w="9px" h="9px" borderRadius="full" bg="#885df6" animation={`${pulseDot} 1.6s ease-out infinite`} /><Text fontSize="sm" fontWeight="600">Billets envoyes automatiquement</Text></HStack><Text fontFamily="var(--font-landing-heading), sans-serif" fontWeight="700" color="var(--landing-accent)">+18%</Text></Flex>
        </Box>
        <HStack borderRadius="2xl" border="1px solid" borderColor="var(--landing-border)" bg="var(--landing-surface)" px={4} py={3} justify="space-between"><Text color="var(--landing-muted)">Page publique partageable en 1 clic</Text><Icon as={MdArrowOutward} color="var(--landing-accent)" /></HStack>
      </Stack>
    </Grid>
  )
}

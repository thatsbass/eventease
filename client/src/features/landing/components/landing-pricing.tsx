import NextLink from "next/link"
import { Badge, Box, Button, HStack, Icon, Link, SimpleGrid, Stack, Text } from "@chakra-ui/react"
import { MdCheckCircle } from "react-icons/md"
import { PRICING_ITEMS, reveal } from "./landing.constants"

export function LandingPricing() {
  return (
    <Box as="section" id="pricing" py={{ base: 12, md: 16 }}>
      <Stack gap={3} maxW="700px" animation={reveal(60)}>
        <Text as="h2" fontFamily="var(--font-landing-heading), sans-serif" fontSize={{ base: "3xl", md: "5xl" }} lineHeight="1.05" letterSpacing="-0.03em">Commencez vite, scalez quand vous voulez</Text>
        <Text color="var(--landing-muted)">Un plan gratuit pour demarrer. Un plan pro pour les organisateurs qui montent en puissance.</Text>
      </Stack>
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={4} mt={7}>{PRICING_ITEMS.map((item, index) => <Box key={item.name} borderRadius="3xl" border="1px solid" borderColor={item.highlighted ? "var(--landing-accent)" : "var(--landing-border)"} bg={item.highlighted ? "var(--landing-accent-soft)" : "var(--landing-surface)"} px={{ base: 5, md: 6 }} py={{ base: 5, md: 6 }} animation={reveal(120 + index * 90)}><HStack justify="space-between" align="start" mb={4}><Stack gap={1}><Text fontFamily="var(--font-landing-heading), sans-serif" fontSize="2xl">{item.name}</Text><Text color="var(--landing-muted)">{item.subtitle}</Text></Stack>{item.highlighted ? <Badge borderRadius="full" bg="var(--landing-accent)" color="white" px={2.5}>Populaire</Badge> : null}</HStack><Text fontFamily="var(--font-landing-heading), sans-serif" fontSize={{ base: "4xl", md: "5xl" }} lineHeight="1" letterSpacing="-0.03em" mb={5}>{item.price}</Text><Stack gap={2.5} mb={6}>{item.bullets.map((bullet) => <HStack key={bullet} align="start" gap={2}><Icon as={MdCheckCircle} color="var(--landing-accent)" mt={0.5} /><Text>{bullet}</Text></HStack>)}</Stack><Link as={NextLink} href={item.href} _hover={{ textDecoration: "none" }}><Button w="full" h="44px" borderRadius="full" bg={item.highlighted ? "var(--landing-highlight)" : "white"} color={item.highlighted ? "white" : "gray.900"} _hover={{ opacity: 0.92 }}>{item.ctaLabel}</Button></Link></Box>)}</SimpleGrid>
    </Box>
  )
}

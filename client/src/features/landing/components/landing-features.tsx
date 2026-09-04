import { Box, HStack, Icon, SimpleGrid, Stack, Text } from "@chakra-ui/react"
import { FEATURE_ITEMS, reveal, STEP_ITEMS } from "./landing.constants"

export function LandingFeatures() {
  return (
    <>
      <Box hidden as="section" id="features" py={{ base: 10, md: 16 }}>
        <Stack gap={3} textAlign={{ base: "left", md: "center" }} maxW="760px" mx={{ md: "auto" }} mb={8}>
          <Text as="h2" fontFamily="var(--font-landing-heading), sans-serif" fontSize={{ base: "3xl", md: "5xl" }} lineHeight="1.05" letterSpacing="-0.03em" animation={reveal(100)}>Une stack moderne pour vendre et operer vos evenements</Text>
          <Text color="var(--landing-muted)" animation={reveal(140)}>Chaque bloc a ete pense pour reduire la charge operationnelle et augmenter la conversion sur la page publique.</Text>
        </Stack>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>{FEATURE_ITEMS.map((item, index) => <Box key={item.title} borderRadius="2xl" border="1px solid" borderColor="var(--landing-border)" bg="var(--landing-surface)" px={5} py={5} animation={reveal(170 + index * 70)}><HStack w="42px" h="42px" borderRadius="xl" align="center" justify="center" bg="var(--landing-accent-soft)" color="var(--landing-accent)" mb={3}><Icon as={item.icon} boxSize={5} /></HStack><Text fontFamily="var(--font-landing-heading), sans-serif" fontSize="xl" mb={2}>{item.title}</Text><Text color="var(--landing-muted)">{item.description}</Text></Box>)}</SimpleGrid>
      </Box>
      <Box hidden as="section" id="workflow" py={{ base: 2, md: 6 }}>
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>{STEP_ITEMS.map((item, index) => <Box key={item.step} borderRadius="2xl" border="1px solid" borderColor="var(--landing-border)" bg={index === 1 ? "var(--landing-accent-soft)" : "var(--landing-surface)"} px={5} py={5} animation={reveal(100 + index * 80)}><Text fontFamily="var(--font-landing-heading), sans-serif" fontSize="sm" color="var(--landing-accent)" fontWeight="700" letterSpacing="0.1em">STEP {item.step}</Text><Text fontFamily="var(--font-landing-heading), sans-serif" fontSize="2xl" lineHeight="1.1" mt={2} mb={2}>{item.title}</Text><Text color="var(--landing-muted)">{item.description}</Text></Box>)}</SimpleGrid>
      </Box>
    </>
  )
}

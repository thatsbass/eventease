import Link from "next/link"
import { Box, Button, Stack, Text } from "@chakra-ui/react"

export default function CheckoutCancelPage() {
  return (
    <Box maxW="680px" mx="auto" px={{ base: 4, md: 6 }} py={{ base: 10, md: 14 }}>
      <Stack
        gap={4}
        p={{ base: 5, md: 7 }}
        bg="whiteAlpha.50"
        border="1px solid"
        borderColor="orange.500"
        borderRadius="2xl"
      >
        <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="semibold" color="orange.300">
          Paiement annule
        </Text>
        <Text color="gray.200">
          Aucun debit n&apos;a ete valide. Vous pouvez reprendre votre commande quand vous voulez.
        </Text>

        <Stack direction={{ base: "column", sm: "row" }} gap={3} pt={2}>
          <Link href="/events">
            <Button variant="outline" borderColor="whiteAlpha.400" color="gray.100">
              Retour aux evenements
            </Button>
          </Link>
        </Stack>
      </Stack>
    </Box>
  )
}

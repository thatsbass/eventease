'use client'

import Link from "next/link"
import {
  Badge,
  Box,
  Button,
  HStack,
  Icon,
  Stack,
  Text,
} from "@chakra-ui/react"
import { MdCheckCircle } from "react-icons/md"

export function CheckoutSuccessPage() {
  return (
    <Box maxW="760px" mx="auto" px={{ base: 4, md: 6 }} py={{ base: 10, md: 14 }}>
      <Box
        borderRadius="2xl"
        border="1px solid"
        borderColor="whiteAlpha.200"
        bg="linear-gradient(135deg, rgba(255,255,255,0.03))"
        p={{ base: 5, md: 7 }}
      >
        <Stack gap={4}>
          <Badge
            w="fit-content"
            bg="green.500"
            color="white"
            borderRadius="full"
            px={3}
            py={1}
            fontSize="xs"
          >
            Paiement confirme
          </Badge>

          <HStack gap={2} align="start">
            <Icon as={MdCheckCircle} boxSize={5} color="whiteAlpha.900" mt={0.5} />
            <Stack gap={2}>
              <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="semibold" lineHeight="1.05">
                Reservation validee
              </Text>
              <Text color="whiteAlpha.700" fontSize="sm">
                Votre paiement est valide. Vos billets seront envoyes par email avec le PDF en
                piece jointe.
              </Text>
            </Stack>
          </HStack>

          <Stack direction={{ base: "column", sm: "row" }} gap={3} pt={1}>
            <Link href="/discover">
              <Button borderRadius="full" bg="whiteAlpha.900" color="blackAlpha.800" _hover={{ bg: "gray.100" }}>
                Retour aux evenements
              </Button>
            </Link>
          </Stack>
        </Stack>
      </Box>
    </Box>
  )
}

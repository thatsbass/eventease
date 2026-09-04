"use client"

import { Center, Spinner, Stack, Text } from "@chakra-ui/react"
import { ApiError } from "@/lib/api/client"
import {
  PublicCheckoutPage,
  type CheckoutItem,
} from "../components/public/public-checkout.page"
import { toPublicEvent } from "../mappers/events.mappers"
import { usePublicEvent } from "../hooks/events.hooks"

type Props = {
  publicId: string
  initialItems: CheckoutItem[]
}

export function PublicCheckoutRoute({ publicId, initialItems }: Props) {
  const query = usePublicEvent(publicId)

  if (query.isLoading) {
    return (
      <Center py={{ base: 10, md: 16 }}>
        <Spinner color="whiteAlpha.600" />
      </Center>
    )
  }

  if (query.isError) {
    const status = query.error instanceof ApiError ? query.error.status : null

    return (
      <Center py={{ base: 10, md: 16 }}>
        <Stack gap={1} textAlign="center">
          <Text fontWeight="semibold">
            {status === 404 ? "Evenement introuvable" : "Impossible de charger l'evenement"}
          </Text>
          <Text color="gray.400" fontSize="sm">
            {status === 404 ? "Verifiez le lien." : "Reessayez dans quelques secondes."}
          </Text>
        </Stack>
      </Center>
    )
  }

  if (!query.data) {
    return (
      <Center py={{ base: 10, md: 16 }}>
        <Spinner color="whiteAlpha.600" />
      </Center>
    )
  }

  const event = toPublicEvent(query.data)

  return <PublicCheckoutPage event={event} initialItems={initialItems} />
}

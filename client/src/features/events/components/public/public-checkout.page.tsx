"use client"

import Link from "next/link"
import {
  Box,
  Button,
  Flex,
  Grid,
  HStack,
  Icon,
  Input,
  InputGroup,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react"
import { MdArrowBack, MdLock, MdPhone } from "react-icons/md"
import { useMemo, useState } from "react"
import type { PublicEvent } from "@/features/events/types/events.types"
import { toaster } from "@/components/ui/toaster"
import { checkoutApi } from "@/features/events/api/checkout.api"
import { LocationMap } from "./public.location-map"

export type CheckoutItem = {
  ticketTypeId: string
  quantity: number
}

type PaymentMethod = "WAVE" | "ORANGE_MONEY" | "CARD"

type PublicCheckoutPageProps = {
  event: PublicEvent
  initialItems: CheckoutItem[]
}

const formatCurrency = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${amount.toLocaleString("fr-FR")} ${currency}`
  }
}

export const PublicCheckoutPage = ({ event, initialItems }: PublicCheckoutPageProps) => {
  const [buyerName, setBuyerName] = useState("")
  const [buyerEmail, setBuyerEmail] = useState("")
  const [buyerPhone, setBuyerPhone] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CARD")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedLines = useMemo(() => {
    return initialItems
      .map((item) => {
        const ticket = event.ticketTypes.find((type) => type.id === item.ticketTypeId)
        if (!ticket || item.quantity <= 0) {
          return null
        }

        return {
          ticket,
          quantity: item.quantity,
          subtotal: ticket.price * item.quantity,
        }
      })
      .filter((line): line is NonNullable<typeof line> => Boolean(line))
  }, [event.ticketTypes, initialItems])

  const totalQuantity = selectedLines.reduce((sum, line) => sum + line.quantity, 0)
  const totalPrice = selectedLines.reduce((sum, line) => sum + line.subtotal, 0)

  const handleCheckout = async () => {
    if (!buyerName.trim() || !buyerEmail.trim() || !buyerPhone.trim()) {
      toaster.create({
        description: "Merci de renseigner votre nom, telephone et email.",
        type: "error",
      })
      return
    }

    if (selectedLines.length === 0) {
      toaster.create({
        description: "Aucun billet selectionne. Retournez a la page evenement.",
        type: "error",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const session = await checkoutApi.createSession({
        publicId: event.publicId,
        buyerName,
        buyerEmail,
        buyerPhone,
        paymentMethod : "CARD",
        items: selectedLines.map((line) => ({
          ticketTypeId: line.ticket.id,
          quantity: line.quantity,
        })),
      })

      toaster.create({
        description: "Redirection vers le paiement securise Stripe...",
        type: "info",
      })

      window.location.href = session.checkoutUrl
    } catch (error) {
      const message = error instanceof Error ? error.message : "Impossible de finaliser le paiement."
      toaster.create({
        description: message,
        type: "error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box maxW="1200px" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 8, md: 10 }}>
      <Grid templateColumns={{ base: "1fr", lg: "1fr 1.25fr" }} gap={8} alignItems="start">
        <Stack gap={5}>
          <Link href={`/events/${event.publicId}`}>
            <Button
              size="sm"
              variant="ghost"
              color="gray.300"
              borderRadius="full"
              _hover={{ bg: "whiteAlpha.200" }}
            >
              <HStack gap={2}>
                <Icon as={MdArrowBack} />
                <Text>Retour a l&apos;evenement</Text>
              </HStack>
            </Button>
          </Link>

          <Box
            bg="whiteAlpha.50"
            border="1px solid"
            borderColor="whiteAlpha.200"
            borderRadius="2xl"
            p={5}
          >
            <Stack gap={2}>
              <Text fontWeight="semibold">{event.title}</Text>
              <Text fontSize="sm" color="gray.400">
                {event.date} - {event.time}
              </Text>
              <Text fontSize="sm" color="gray.300">
                {event.location}
              </Text>
            </Stack>
            <Box mt={4}>
              <LocationMap address={event.location} />
            </Box>
          </Box>
        </Stack>

        <Stack gap={5}>
          <Box
            bg="whiteAlpha.50"
            border="1px solid"
            borderColor="whiteAlpha.200"
            borderRadius="2xl"
            p={5}
          >
            <Stack gap={4}>
              <Text fontWeight="semibold" fontSize="lg">
                Informations acheteur
              </Text>
              <InputGroup>
                <Input
                  bg="whiteAlpha.100"
                  borderColor="whiteAlpha.200"
                  borderRadius={"full"}
                  color="gray.100"
                  _placeholder={{color: "whiteAlpha.500"}}
                  placeholder="Nom complet"
                  value={buyerName}
                  onChange={(event) => setBuyerName(event.target.value)}
                />
              </InputGroup>
              <InputGroup>
                <Input
                  bg="whiteAlpha.100"
                  borderColor="whiteAlpha.200"
                  borderRadius={"full"}
                  color="gray.100"
                  _placeholder={{color: "whiteAlpha.500"}}
                  placeholder="Telephone"
                  value={buyerPhone}
                  onChange={(event) => setBuyerPhone(event.target.value)}
                />
              </InputGroup>
              <InputGroup>
                <Input
                  bg="whiteAlpha.100"
                  borderColor="whiteAlpha.200"
                  borderRadius={"full"}
                  color="gray.100"
                  _placeholder={{color: "whiteAlpha.500"}}
                  placeholder="Email"
                  type="email"
                  value={buyerEmail}
                  onChange={(event) => setBuyerEmail(event.target.value)}
                />
              </InputGroup>
            </Stack>
          </Box>

          {/* <Box
            bg="whiteAlpha.50"
            border="1px solid"
            borderColor="whiteAlpha.200"
            borderRadius="2xl"
            p={5}
          >
            <Stack gap={4} hidden>
              <Text fontWeight="semibold" fontSize="lg">
                Type de paiement
              </Text>
              <HStack gap={3} flexWrap="wrap">
                <Button
                  variant={paymentMethod === "WAVE" ? "solid" : "outline"}
                  bg={paymentMethod === "WAVE" ? "white" : "transparent"}
                  color={paymentMethod === "WAVE" ? "gray.900" : "gray.100"}
                  borderColor="whiteAlpha.300"
                  onClick={() => setPaymentMethod("WAVE")}
                >
                  Wave
                </Button>
                <Button
                  variant={paymentMethod === "ORANGE_MONEY" ? "solid" : "outline"}
                  bg={paymentMethod === "ORANGE_MONEY" ? "orange.400" : "transparent"}
                  color={paymentMethod === "ORANGE_MONEY" ? "gray.900" : "gray.100"}
                  borderColor="whiteAlpha.300"
                  onClick={() => setPaymentMethod("ORANGE_MONEY")}
                >
                  Orange Money
                </Button>
                <Button
                  variant={paymentMethod === "CARD" ? "solid" : "outline"}
                  bg={paymentMethod === "CARD" ? "blue.400" : "transparent"}
                  color={paymentMethod === "CARD" ? "gray.900" : "gray.100"}
                  borderColor="whiteAlpha.300"
                  onClick={() => setPaymentMethod("CARD")}
                >
                  Carte bancaire
                </Button>
              </HStack>
            </Stack>
          </Box> */}

          <Box
            bg="whiteAlpha.50"
            border="1px solid"
            borderColor="whiteAlpha.200"
            borderRadius="2xl"
            p={5}
          >
            <Stack gap={4}>
              <Text fontWeight="semibold" fontSize="lg">
                Resume commande
              </Text>
              {selectedLines.length === 0 ? (
                <Text color="orange.300">Aucun billet selectionne.</Text>
              ) : (
                <VStack align="stretch" gap={3}>
                  {selectedLines.map((line) => (
                    <Flex key={line.ticket.id} justify="space-between" fontSize="sm">
                      <Text color="gray.300">
                        {line.ticket.name} x {line.quantity}
                      </Text>
                      <Text color="gray.100">
                        {formatCurrency(line.subtotal, line.ticket.currency)}
                      </Text>
                    </Flex>
                  ))}
                </VStack>
              )}

              <Flex justify="space-between" fontWeight="semibold">
                <Text>Total ({totalQuantity})</Text>
                <Text>{formatCurrency(totalPrice, event.ticketTypes[0]?.currency ?? "XOF")}</Text>
              </Flex>

              <Button
                bg="white"
                color="gray.900"
                borderRadius="xl"
                h="46px"
                _hover={{ bg: "gray.100" }}
                loading={isSubmitting}
                disabled={selectedLines.length === 0}
                onClick={handleCheckout}
              >
                Continuer vers Stripe
              </Button>

              <HStack justify="space-between" color="gray.500" fontSize="xs">
                <HStack>
                  <Icon as={MdLock} />
                  <Text>Paiement securise</Text>
                </HStack>
                <HStack>
                  <Icon as={MdPhone} />
                  <Text>Support 24/7</Text>
                </HStack>
              </HStack>
            </Stack>
          </Box>

        </Stack>
      </Grid>
    </Box>
  )
}

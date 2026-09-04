"use client"

import { Button, Dialog, HStack, Icon, Input, Portal, Stack, Text, Textarea } from "@chakra-ui/react"
import { useEffect, useState, type FormEvent, type ReactNode } from "react"
import { MdDescription, MdLocalOffer, MdPayments, MdWarehouse } from "react-icons/md"
import { z } from "zod"
import { ApiError } from "@/lib/api/client"
import { createTicketTypeRequestSchema, type CreateTicketTypeRequest } from "@/features/events/schemas/events.requests"
import type { TicketTierDto } from "@/features/events/schemas/events.schemas"
import type { TicketType } from "@/features/events/types/events.types"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  ticket: TicketType
  onSubmit?: (values: CreateTicketTypeRequest) => Promise<unknown> | unknown
  isSubmitting?: boolean
}

const FORM_ID = "edit-ticket-type-form"

const getErrorMessage = (err: unknown) => {
  if (err instanceof z.ZodError) {
    return err.issues[0]?.message ?? "Donnees invalides"
  }

  if (err instanceof ApiError) {
    return err.message || "Une erreur est survenue"
  }

  if (err instanceof Error) {
    return err.message || "Une erreur est survenue"
  }

  return "Une erreur est survenue"
}

export function EditTicketTypeDialog({ open, onOpenChange, ticket, onSubmit, isSubmitting }: Props) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [tier, setTier] = useState<TicketTierDto>("standard")
  const [priceRaw, setPriceRaw] = useState("0")
  const [quantityRaw, setQuantityRaw] = useState("0")
  const [currency, setCurrency] = useState("XOF")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return

    setName(ticket.name ?? "")
    setDescription(ticket.description ?? "")
    setTier(ticket.tier)
    setPriceRaw(String(ticket.price ?? 0))
    setQuantityRaw(String(ticket.quantity ?? 0))
    setCurrency(ticket.currency ?? "XOF")
    setError(null)
  }, [open, ticket.id, ticket.name, ticket.description, ticket.tier, ticket.price, ticket.quantity, ticket.currency])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      if (!onSubmit) return

      const price = Number.parseInt(priceRaw, 10)
      const quantity = Number.parseInt(quantityRaw, 10)

      if (!Number.isFinite(quantity) || quantity < ticket.sold) {
        throw new Error(`La quantite doit etre >= ${ticket.sold}.`)
      }

      const payload = createTicketTypeRequestSchema.parse({
        name,
        description: description.trim() ? description.trim() : undefined,
        tier,
        price,
        quantity,
        currency: currency.trim().toUpperCase(),
      })

      await onSubmit(payload)
      onOpenChange(false)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(d) => onOpenChange(d.open)}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            bg="rgba(18, 18, 20, 0.92)"
            backdropFilter="blur(18px)"
            border="1px solid"
            borderColor="whiteAlpha.200"
            borderRadius="2xl"
            boxShadow="0 30px 80px rgba(0, 0, 0, 0.45)"
            px={6}
            py={5}
            maxW="560px"
          >
            <Dialog.Header>
              <Stack gap={1}>
                <Dialog.Title color="gray.100" fontWeight="semibold">
                  Modifier le billet
                </Dialog.Title>
                <Dialog.Description color="gray.500" fontSize="sm">
                  Vendu: {ticket.sold}. La quantite ne peut pas etre inferieure.
                </Dialog.Description>
              </Stack>
            </Dialog.Header>

            <Dialog.Body pt={4}>
              <Stack as="form" id={FORM_ID} gap={4} onSubmit={handleSubmit}>
                <BoxField label="Nom" icon={MdLocalOffer}>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Pass Standard"
                    bg="blackAlpha.500"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                    borderRadius="lg"
                    size="sm"
                    color="gray.100"
                    _placeholder={{ color: "gray.500" }}
                  />
                </BoxField>

                <BoxField label="Type" icon={MdLocalOffer}>
                  <HStack gap={2} flexWrap="wrap">
                    <TierButton value="standard" label="Standard" selected={tier === "standard"} onSelect={setTier} />
                    <TierButton value="early" label="Early" selected={tier === "early"} onSelect={setTier} />
                    <TierButton value="vip" label="VIP" selected={tier === "vip"} onSelect={setTier} />
                  </HStack>
                </BoxField>

                <HStack gap={3} align="start">
                  <BoxField label="Prix" icon={MdPayments} flex="1">
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={1}
                      value={priceRaw}
                      onChange={(e) => setPriceRaw(e.target.value)}
                      placeholder="0"
                      bg="blackAlpha.500"
                      border="1px solid"
                      borderColor="whiteAlpha.200"
                      borderRadius="lg"
                      size="sm"
                      color="gray.100"
                      _placeholder={{ color: "gray.500" }}
                    />
                  </BoxField>

                  <BoxField label="Devise" icon={MdPayments} flex="1">
                    <Input
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      placeholder="XOF"
                      bg="blackAlpha.500"
                      border="1px solid"
                      borderColor="whiteAlpha.200"
                      borderRadius="lg"
                      size="sm"
                      color="gray.100"
                      _placeholder={{ color: "gray.500" }}
                    />
                  </BoxField>
                </HStack>

                <BoxField label="Quantite" icon={MdWarehouse}>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={ticket.sold}
                    step={1}
                    value={quantityRaw}
                    onChange={(e) => setQuantityRaw(e.target.value)}
                    placeholder="100"
                    bg="blackAlpha.500"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                    borderRadius="lg"
                    size="sm"
                    color="gray.100"
                    _placeholder={{ color: "gray.500" }}
                  />
                </BoxField>

                <BoxField label="Description (optionnel)" icon={MdDescription}>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ce que le billet inclut..."
                    resize="vertical"
                    minH="90px"
                    bg="blackAlpha.500"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                    borderRadius="lg"
                    size="sm"
                    color="gray.100"
                    _placeholder={{ color: "gray.500" }}
                  />
                </BoxField>

                {error ? (
                  <Text fontSize="xs" color="red.300">
                    {error}
                  </Text>
                ) : null}
              </Stack>
            </Dialog.Body>

            <Dialog.Footer pt={6}>
              <Stack w="full" gap={3} direction={{ base: "column", sm: "row" }} justify="flex-end">
                <Dialog.CloseTrigger asChild>
                  <Button
                    variant="outline"
                    borderColor="whiteAlpha.200"
                    color="gray.200"
                    _hover={{ bg: "whiteAlpha.100" }}
                  >
                    Annuler
                  </Button>
                </Dialog.CloseTrigger>

                <Button
                  type="submit"
                  form={FORM_ID}
                  bg="white"
                  color="gray.900"
                  _hover={{ bg: "gray.100" }}
                  loading={Boolean(isSubmitting)}
                  disabled={!onSubmit}
                >
                  Enregistrer
                </Button>
              </Stack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

type TierButtonProps = {
  value: TicketTierDto
  label: string
  selected: boolean
  onSelect: (value: TicketTierDto) => void
}

function TierButton({ value, label, selected, onSelect }: TierButtonProps) {
  return (
    <Button
      size="sm"
      bg={selected ? "white" : "whiteAlpha.100"}
      color={selected ? "gray.900" : "gray.200"}
      border="1px solid"
      borderColor={selected ? "white" : "whiteAlpha.200"}
      borderRadius="full"
      _hover={{ bg: selected ? "gray.100" : "whiteAlpha.200" }}
      onClick={() => onSelect(value)}
      type="button"
    >
      {label}
    </Button>
  )
}

type BoxFieldProps = {
  label: string
  icon?: any
  children: ReactNode
  flex?: string | number
}

function BoxField({ label, icon, children, flex }: BoxFieldProps) {
  return (
    <Stack gap={2} flex={flex}>
      <HStack gap={2} color="gray.400">
        {icon ? <Icon as={icon} /> : null}
        <Text fontSize="xs">{label}</Text>
      </HStack>
      {children}
    </Stack>
  )
}


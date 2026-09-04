"use client"

import { Button, Dialog, HStack, Icon, Input, Portal, Stack, Text } from "@chakra-ui/react"
import { useEffect, useState, type FormEvent, type ReactNode } from "react"
import { MdOutlineGroups } from "react-icons/md"
import { z } from "zod"
import { ApiError } from "@/lib/api/client"
import { updateEventRequestSchema } from "@/features/events/schemas/events.requests"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialCapacity: number | null
  onSubmit?: (capacity: number | null) => Promise<unknown> | unknown
  isSubmitting?: boolean
}

type CapacityMode = "unlimited" | "limited"

const FORM_ID = "event-capacity-form"

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

export function EventCapacityDialog({ open, onOpenChange, initialCapacity, onSubmit, isSubmitting }: Props) {
  const [mode, setMode] = useState<CapacityMode>("unlimited")
  const [capacityRaw, setCapacityRaw] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return

    if (typeof initialCapacity === "number") {
      setMode("limited")
      setCapacityRaw(String(initialCapacity))
    } else {
      setMode("unlimited")
      setCapacityRaw("")
    }

    setError(null)
  }, [open, initialCapacity])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      if (!onSubmit) return

      const capacity = mode === "unlimited" ? null : Number.parseInt(capacityRaw, 10)

      updateEventRequestSchema.parse({ capacity })

      await onSubmit(capacity)
      onOpenChange(false)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const displayValue = typeof initialCapacity === "number" ? `${initialCapacity}` : "Illimitee"

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
            maxW="520px"
          >
            <Dialog.Header>
              <Stack gap={1}>
                <Dialog.Title color="gray.100" fontWeight="semibold">
                  Capacite des participants
                </Dialog.Title>
                <Dialog.Description color="gray.500" fontSize="sm">
                  Actuel: {displayValue}
                </Dialog.Description>
              </Stack>
            </Dialog.Header>

            <Dialog.Body pt={4}>
              <Stack as="form" id={FORM_ID} gap={4} onSubmit={handleSubmit}>
                <BoxField label="Mode" icon={MdOutlineGroups}>
                  <HStack gap={2} flexWrap="wrap">
                    <ModeButton
                      label="Illimitee"
                      selected={mode === "unlimited"}
                      onClick={() => setMode("unlimited")}
                    />
                    <ModeButton label="Limitee" selected={mode === "limited"} onClick={() => setMode("limited")} />
                  </HStack>
                </BoxField>

                {mode === "limited" ? (
                  <BoxField label="Capacite" icon={MdOutlineGroups}>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={1}
                      value={capacityRaw}
                      onChange={(e) => setCapacityRaw(e.target.value)}
                      placeholder="50"
                      bg="blackAlpha.500"
                      border="1px solid"
                      borderColor="whiteAlpha.200"
                      borderRadius="lg"
                      size="sm"
                      color="gray.100"
                      _placeholder={{ color: "gray.500" }}
                    />
                    <Text fontSize="xs" color="gray.500" mt={2}>
                      Astuce: 0 = aucun participant.
                    </Text>
                  </BoxField>
                ) : null}

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

type ModeButtonProps = {
  label: string
  selected: boolean
  onClick: () => void
}

function ModeButton({ label, selected, onClick }: ModeButtonProps) {
  return (
    <Button
      size="sm"
      bg={selected ? "white" : "whiteAlpha.100"}
      color={selected ? "gray.900" : "gray.200"}
      border="1px solid"
      borderColor={selected ? "white" : "whiteAlpha.200"}
      borderRadius="full"
      _hover={{ bg: selected ? "gray.100" : "whiteAlpha.200" }}
      onClick={onClick}
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
}

function BoxField({ label, icon, children }: BoxFieldProps) {
  return (
    <Stack gap={2}>
      <HStack gap={2} color="gray.400">
        {icon ? <Icon as={icon} /> : null}
        <Text fontSize="xs">{label}</Text>
      </HStack>
      {children}
    </Stack>
  )
}


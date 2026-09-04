"use client"

import { useEffect, useState, type FormEvent, type ReactNode } from "react"
import {
  Button,
  CloseButton,
  Drawer,
  Flex,
  HStack,
  Icon,
  Input,
  Portal,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react"
import { MdCalendarMonth, MdLocationOn, MdSubject } from "react-icons/md"
import { z } from "zod"
import { ApiError } from "@/lib/api/client"
import type { EventDto } from "@/features/events/schemas/events.schemas"
import type { UpdateEventRequest } from "@/features/events/schemas/events.requests"
import { isoToUtcDateTimeLocal, utcDateTimeLocalToIso } from "@/features/events/utils/datetime-local"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: EventDto
  onSubmit?: (values: UpdateEventRequest) => Promise<unknown> | unknown
  isSubmitting?: boolean
}

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

export function EditEventDrawer({ open, onOpenChange, event, onSubmit, isSubmitting }: Props) {
  const [title, setTitle] = useState("")
  const [startAtLocal, setStartAtLocal] = useState("")
  const [endAtLocal, setEndAtLocal] = useState("")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return

    setTitle(event.title ?? "")
    setLocation(event.location ?? "")
    setDescription(event.description ?? "")
    setStartAtLocal(isoToUtcDateTimeLocal(event.startAt))
    setEndAtLocal(isoToUtcDateTimeLocal(event.endAt))
    setError(null)
  }, [open, event.id, event.updatedAt, event.title, event.location, event.description, event.startAt, event.endAt])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      if (!onSubmit) return

      if (!title.trim()) throw new Error("Nom de l'evenement requis.")
      if (!location.trim()) throw new Error("Lieu requis.")
      if (!startAtLocal.trim()) throw new Error("Date de debut requise.")

      const startAtIso = utcDateTimeLocalToIso(startAtLocal)
      const endAtIso = endAtLocal.trim() ? utcDateTimeLocalToIso(endAtLocal) : undefined

      const startAt = new Date(startAtIso)
      const endAt = endAtIso ? new Date(endAtIso) : null

      if (endAt && endAt.getTime() <= startAt.getTime()) {
        throw new Error("La date de fin doit etre apres la date de debut.")
      }

      const payload: UpdateEventRequest = {
        title: title.trim(),
        location: location.trim(),
        description: description,
        startAt: startAtIso,
        endAt: endAtIso,
      }

      await onSubmit(payload)
      onOpenChange(false)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <Drawer.Root open={open} placement="end" size={{ base: "full", md: "md" }} onOpenChange={(d) => onOpenChange(d.open)}>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content
            bg="rgba(18, 18, 20, 0.92)"
            backdropFilter="blur(18px)"
            borderLeft="1px solid"
            borderColor="whiteAlpha.200"
            boxShadow="0 30px 80px rgba(0, 0, 0, 0.45)"
            overflow="hidden"
          >
            <Drawer.CloseTrigger asChild>
              <CloseButton
                color="whiteAlpha.600"
                _hover={{ bg: "transparent", color: "whiteAlpha.800" }}
                size="sm"
                position="absolute"
                top="4"
                right="4"
                zIndex={2}
              />
            </Drawer.CloseTrigger>

            <Drawer.Header px={6} pt={6} pb={3}>
              <Stack gap={1}>
                <Text fontWeight="semibold" color="gray.100">
                  Modifier l'evenement
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Dates en UTC (MVP).
                </Text>
              </Stack>
            </Drawer.Header>

            <Drawer.Body px={6} pb={6} className="hidden-scroll">
              <Stack as="form" gap={4} onSubmit={handleSubmit}>
                <BoxField label="Nom">
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Nom de l'evenement"
                    bg="blackAlpha.500"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                    borderRadius="lg"
                    size="sm"
                    color="gray.100"
                    _placeholder={{ color: "gray.500" }}
                  />
                </BoxField>

                <HStack gap={3} align="start">
                  <BoxField label="Debut" icon={MdCalendarMonth} flex="1">
                    <Input
                      type="datetime-local"
                      value={startAtLocal}
                      onChange={(e) => setStartAtLocal(e.target.value)}
                      bg="blackAlpha.500"
                      border="1px solid"
                      borderColor="whiteAlpha.200"
                      borderRadius="lg"
                      size="sm"
                      color="gray.100"
                      _placeholder={{ color: "gray.500" }}
                    />
                  </BoxField>

                  <BoxField label="Fin (optionnel)" icon={MdCalendarMonth} flex="1">
                    <Input
                      type="datetime-local"
                      value={endAtLocal}
                      onChange={(e) => setEndAtLocal(e.target.value)}
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

                <BoxField label="Lieu" icon={MdLocationOn}>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Lieu physique ou lien virtuel"
                    bg="blackAlpha.500"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                    borderRadius="lg"
                    size="sm"
                    color="gray.100"
                    _placeholder={{ color: "gray.500" }}
                  />
                </BoxField>

                <BoxField label="Description" icon={MdSubject}>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Parle un peu de ton evenement..."
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

                <Flex gap={3} justify="flex-end" pt={2}>
                  <Button
                    variant="outline"
                    borderColor="whiteAlpha.200"
                    color="gray.200"
                    _hover={{ bg: "whiteAlpha.100" }}
                    onClick={() => onOpenChange(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    bg="white"
                    color="gray.900"
                    _hover={{ bg: "gray.100" }}
                    loading={Boolean(isSubmitting)}
                    disabled={!onSubmit}
                  >
                    Enregistrer
                  </Button>
                </Flex>
              </Stack>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
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

"use client"

import { Center, Spinner, Stack, Text } from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ApiError } from "@/lib/api/client"
import { toaster } from "@/components/ui/toaster"
import { useAuthUser } from "@/features/auth/hooks/use-auth-user"
import { eventsApi } from "../api/events.api"
import { EventBackstagePage } from "../components/backstage/event.backstage.page"
import { eventQueryKeys, useMyEvent } from "../hooks/events.hooks"
import { toOrganizer, toOrganizerTimelineEvent } from "../mappers/events.mappers"
import type { CreateTicketTypeRequest, UpdateEventRequest } from "../schemas/events.requests"
import type { EventDto } from "../schemas/events.schemas"

type Props = {
  eventId: string
}

const getErrorMessage = (err: unknown) => {
  if (err instanceof ApiError) {
    return err.message || "Une erreur est survenue"
  }

  if (err instanceof Error) {
    return err.message || "Une erreur est survenue"
  }

  return "Une erreur est survenue"
}

export function BackstageRoute({ eventId }: Props) {
  const { user } = useAuthUser()
  const query = useMyEvent(eventId)
  const queryClient = useQueryClient()

  const applyEventUpdateToCache = (updated: EventDto) => {
    queryClient.setQueryData(eventQueryKeys.mineById(eventId), updated)
    queryClient.setQueryData(eventQueryKeys.mineList(), (previous) => {
      if (!Array.isArray(previous)) return previous
      return previous.map((event) => (event.id === updated.id ? updated : event))
    })
  }

  const uploadCoverMutation = useMutation({
    mutationFn: (file: File) => eventsApi.uploadCover(eventId, file),
    onSuccess: (updated) => {
      applyEventUpdateToCache(updated)

      toaster.create({
        description: "Couverture mise a jour.",
        type: "success",
      })
    },
    onError: (err) => {
      toaster.create({
        description: getErrorMessage(err),
        type: "error",
      })
    },
  })

  const updateEventMutation = useMutation({
    mutationFn: (values: UpdateEventRequest) => eventsApi.update(eventId, values),
    onSuccess: (updated) => {
      applyEventUpdateToCache(updated)

      toaster.create({
        description: "Evenement mis a jour.",
        type: "success",
      })
    },
  })

  const publishMutation = useMutation({
    mutationFn: () => eventsApi.publish(eventId),
    onSuccess: (updated) => {
      applyEventUpdateToCache(updated)

      toaster.create({
        description: "Evenement publie.",
        type: "success",
      })
    },
    onError: (err) => {
      toaster.create({
        description: getErrorMessage(err),
        type: "error",
      })
    },
  })

  const unpublishMutation = useMutation({
    mutationFn: () => eventsApi.unpublish(eventId),
    onSuccess: (updated) => {
      applyEventUpdateToCache(updated)

      toaster.create({
        description: "Evenement mis en brouillon.",
        type: "success",
      })
    },
    onError: (err) => {
      toaster.create({
        description: getErrorMessage(err),
        type: "error",
      })
    },
  })

  const cancelMutation = useMutation({
    mutationFn: () => eventsApi.update(eventId, { status: "CANCELLED" }),
    onSuccess: (updated) => {
      applyEventUpdateToCache(updated)

      toaster.create({
        description: "Evenement annule.",
        type: "success",
      })
    },
    onError: (err) => {
      toaster.create({
        description: getErrorMessage(err),
        type: "error",
      })
    },
  })

  const createTicketTypeMutation = useMutation({
    mutationFn: (values: CreateTicketTypeRequest) => eventsApi.createTicketType(eventId, values),
    onSuccess: (created) => {
      queryClient.setQueryData(eventQueryKeys.mineById(eventId), (previous: EventDto | undefined) => {
        if (!previous) return previous
        return { ...previous, ticketTypes: [...previous.ticketTypes, created] }
      })

      queryClient.setQueryData(eventQueryKeys.mineList(), (previous) => {
        if (!Array.isArray(previous)) return previous
        return previous.map((event) =>
          event.id === eventId ? { ...event, ticketTypes: [...event.ticketTypes, created] } : event,
        )
      })

      toaster.create({
        description: "Billet ajoute.",
        type: "success",
      })
    },
    onError: (err) => {
      toaster.create({
        description: getErrorMessage(err),
        type: "error",
      })
    },
  })

  const updateTicketTypeMutation = useMutation({
    mutationFn: ({ ticketTypeId, values }: { ticketTypeId: string; values: CreateTicketTypeRequest }) =>
      eventsApi.updateTicketType(ticketTypeId, values),
    onSuccess: (updated) => {
      queryClient.setQueryData(eventQueryKeys.mineById(eventId), (previous: EventDto | undefined) => {
        if (!previous) return previous
        return {
          ...previous,
          ticketTypes: previous.ticketTypes.map((t) => (t.id === updated.id ? updated : t)),
        }
      })

      queryClient.setQueryData(eventQueryKeys.mineList(), (previous: EventDto[] | undefined) => {
        if (!previous) return previous

        return previous.map((event) =>
          event.id === eventId
            ? { ...event, ticketTypes: event.ticketTypes.map((t) => (t.id === updated.id ? updated : t)) }
            : event,
        )
      })

      toaster.create({
        description: "Billet mis a jour.",
        type: "success",
      })
    },
    onError: (err) => {
      toaster.create({
        description: getErrorMessage(err),
        type: "error",
      })
    },
  })

  const deleteTicketTypeMutation = useMutation({
    mutationFn: (ticketTypeId: string) => eventsApi.deleteTicketType(ticketTypeId),
    onSuccess: (_, ticketTypeId) => {
      queryClient.setQueryData(eventQueryKeys.mineById(eventId), (previous: EventDto | undefined) => {
        if (!previous) return previous
        return {
          ...previous,
          ticketTypes: previous.ticketTypes.filter((t) => t.id !== ticketTypeId),
        }
      })

      queryClient.setQueryData(eventQueryKeys.mineList(), (previous: EventDto[] | undefined) => {
        if (!previous) return previous

        return previous.map((event) =>
          event.id === eventId
            ? { ...event, ticketTypes: event.ticketTypes.filter((t) => t.id !== ticketTypeId) }
            : event,
        )
      })

      toaster.create({
        description: "Billet supprime.",
        type: "success",
      })
    },
    onError: (err) => {
      toaster.create({
        description: getErrorMessage(err),
        type: "error",
      })
    },
  })

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

  const event = toOrganizerTimelineEvent(query.data)
  const organizer = toOrganizer(user, [event])

  return (
    <EventBackstagePage
      event={event}
      organizer={organizer}
      eventDto={query.data}
      onUploadCover={(file) => uploadCoverMutation.mutate(file)}
      isUploadingCover={uploadCoverMutation.isPending}
      onUpdateEvent={(values) => updateEventMutation.mutateAsync(values)}
      isUpdatingEvent={updateEventMutation.isPending}
      onPublish={() => publishMutation.mutate()}
      onUnpublish={() => unpublishMutation.mutate()}
      isPublishing={publishMutation.isPending || unpublishMutation.isPending}
      onCancelEvent={() => cancelMutation.mutateAsync()}
      isCancellingEvent={cancelMutation.isPending}
      onCreateTicketType={(values) => createTicketTypeMutation.mutateAsync(values)}
      isCreatingTicketType={createTicketTypeMutation.isPending}
      onUpdateTicketType={(ticketTypeId, values) =>
        updateTicketTypeMutation.mutateAsync({ ticketTypeId, values })
      }
      isUpdatingTicketType={updateTicketTypeMutation.isPending}
      onDeleteTicketType={(ticketTypeId) => deleteTicketTypeMutation.mutateAsync(ticketTypeId)}
      isDeletingTicketType={deleteTicketTypeMutation.isPending}
    />
  )
}

"use client"

import { Center, Stack, Text } from "@chakra-ui/react"
import { useAuthUser } from "@/features/auth/hooks/use-auth-user"
import { EventPage } from "../components/even.page"
import { EventsListSkeleton } from "../components/events-list.skeleton"
import { useMyEvents } from "../hooks/events.hooks"
import { toOrganizer, toOrganizerTimelineEvent } from "../mappers/events.mappers"

export function MyEventsRoute() {
  const { user } = useAuthUser()
  const query = useMyEvents()

  if (query.isLoading) {
    return <EventsListSkeleton />
  }

  if (query.isError) {
    return (
      <Center py={{ base: 10, md: 16 }}>
        <Stack gap={1} textAlign="center">
          <Text fontWeight="semibold">Impossible de charger vos evenements</Text>
          <Text color="gray.400" fontSize="sm">
            Reessayez dans quelques secondes.
          </Text>
        </Stack>
      </Center>
    )
  }

  const events = (query.data ?? []).map(toOrganizerTimelineEvent)
  const organizer = toOrganizer(user, events)

  return <EventPage organizer={organizer} />
}

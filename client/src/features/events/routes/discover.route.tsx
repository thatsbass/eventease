"use client"

import { Center, Spinner, Stack, Text } from "@chakra-ui/react"
import { ApiError } from "@/lib/api/client"
import { usePublicEvents } from "../hooks/events.hooks"
import { toOrganizerTimelineEvent } from "../mappers/events.mappers"
import type { Organizer } from "../types/events.types"
import { DiscoverPage } from "../components/discover.page"

const DICEBEAR_BASE_URL = "https://api.dicebear.com/9.x/glass/svg?seed="

const makeDicebearUrl = (seed: string) => {
  const safeSeed = encodeURIComponent(seed || "User")
  return `${DICEBEAR_BASE_URL}${safeSeed}`
}

export function DiscoverRoute() {
  const query = usePublicEvents()

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
            {status === 404 ? "Evenements introuvables" : "Impossible de charger les evenements"}
          </Text>
          <Text color="gray.400" fontSize="sm">
            Reessayez dans quelques secondes.
          </Text>
        </Stack>
      </Center>
    )
  }

  const items = (query.data ?? []).map((event) => {
    const eventTimeline = toOrganizerTimelineEvent(event)
    const organizerName = event.organizer.user.name?.trim() || event.organizer.user.username

    const organizer: Organizer = {
      id: event.organizer.user.id,
      slug: event.organizer.user.username,
      name: organizerName,
      username: event.organizer.user.username,
      bio: event.organizer.bio ?? null,
      role: "Organisateur",
      timezone: event.organizer.timezone || "UTC",
      avatarUrl:
        event.organizer.avatarUrl?.trim() ||
        event.organizer.user.avatarUrl?.trim() ||
        makeDicebearUrl(organizerName),
      coverImage: event.organizer.coverImage ?? null,
      isCertified: false,
      events: [],
    }

    return { event: eventTimeline, organizer, category: event.category }
  })

  return <DiscoverPage items={items} />
}

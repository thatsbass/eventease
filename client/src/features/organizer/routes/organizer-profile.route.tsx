"use client"

import { Center, Spinner, Stack, Text } from "@chakra-ui/react"
import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import OrganizerProfilPage from "../org.profil"
import { authApi } from "@/features/auth/api/auth.api"
import { useAuthHydrated } from "@/features/auth/hooks/use-auth-hydrated"
import { useAuthUser } from "@/features/auth/hooks/use-auth-user"
import { eventsApi } from "@/features/events/api/events.api"
import { eventQueryKeys } from "@/features/events/hooks/events.hooks"
import { toOrganizerTimelineEvent } from "@/features/events/mappers/events.mappers"
import type { Organizer } from "@/features/events/types/events.types"

const DICEBEAR_BASE_URL = "https://api.dicebear.com/9.x/glass/svg?seed="

const makeDicebearUrl = (seed: string) => {
  const safeSeed = encodeURIComponent(seed || "User")
  return `${DICEBEAR_BASE_URL}${safeSeed}`
}

type Props = {
  username: string
}

export function OrganizerProfileRoute({ username }: Props) {
  const hydrated = useAuthHydrated()
  const { isAuthenticated } = useAuthUser()

  const meQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: authApi.me,
    enabled: hydrated && isAuthenticated,
    retry: false,
  })

  const normalizedParam = username.trim().toLowerCase()
  const normalizedMe = meQuery.data?.username?.trim().toLowerCase() ?? null
  const isSelf = Boolean(normalizedMe && normalizedMe === normalizedParam)

  const myEventsQuery = useQuery({
    queryKey: eventQueryKeys.mineList(),
    queryFn: () => eventsApi.listMine(),
    enabled: isSelf,
    retry: false,
  })

  const publicEventsQuery = useQuery({
    queryKey: eventQueryKeys.publicList(),
    queryFn: () => eventsApi.listPublic(),
    enabled: hydrated && !isSelf,
    retry: false,
  })

  const ownerOrganizer = useMemo<Organizer | null>(() => {
    if (!meQuery.data) return null

    const name = meQuery.data.name?.trim() || meQuery.data.username
    const events = (myEventsQuery.data ?? []).map(toOrganizerTimelineEvent)

    return {
      id: meQuery.data.id,
      slug: meQuery.data.username,
      name,
      username: meQuery.data.username,
      bio: meQuery.data.organizerProfile?.bio ?? null,
      role: "Organisateur",
      timezone: meQuery.data.organizerProfile?.timezone || "UTC",
      avatarUrl: meQuery.data.avatarUrl?.trim() || makeDicebearUrl(name),
      coverImage: meQuery.data.organizerProfile?.coverImage ?? null,
      isCertified: Boolean(meQuery.data.certified),
      events,
    }
  }, [meQuery.data, myEventsQuery.data])

  const visitorOrganizer = useMemo<Organizer>(() => {
    const all = publicEventsQuery.data ?? []
    const matching = all.filter(
      (event) => event.organizer.user.username.trim().toLowerCase() === normalizedParam,
    )

    const first = matching[0]
    const organizerUsername = first?.organizer.user.username ?? username.trim()
    const name = first?.organizer.user.name?.trim() || organizerUsername

    const avatarUrl =
      first?.organizer.avatarUrl?.trim() ||
      first?.organizer.user.avatarUrl?.trim() ||
      makeDicebearUrl(name)

    const coverImage = first?.organizer.coverImage ?? null
    const bio = first?.organizer.bio ?? null
    const timezone = first?.organizer.timezone || "UTC"

    return {
      id: first?.organizer.user.id ?? "",
      slug: organizerUsername,
      name,
      username: organizerUsername,
      bio,
      role: "Organisateur",
      timezone,
      avatarUrl,
      coverImage,
      isCertified: false,
      events: matching.map(toOrganizerTimelineEvent),
    }
  }, [publicEventsQuery.data, normalizedParam, username])

  if (!hydrated) {
    return (
      <Center py={{ base: 10, md: 16 }}>
        <Spinner color="whiteAlpha.600" />
      </Center>
    )
  }

  if (isAuthenticated && meQuery.isLoading) {
    return (
      <Center py={{ base: 10, md: 16 }}>
        <Spinner color="whiteAlpha.600" />
      </Center>
    )
  }

  if (isSelf) {
    if (myEventsQuery.isLoading) {
      return (
        <Center py={{ base: 10, md: 16 }}>
          <Spinner color="whiteAlpha.600" />
        </Center>
      )
    }

    if (meQuery.isError || myEventsQuery.isError || !ownerOrganizer) {
      return (
        <Center py={{ base: 10, md: 16 }}>
          <Stack gap={1} textAlign="center">
            <Text fontWeight="semibold">Impossible de charger votre profil</Text>
            <Text color="gray.400" fontSize="sm">
              Reessayez dans quelques secondes.
            </Text>
          </Stack>
        </Center>
      )
    }

    return <OrganizerProfilPage organizer={ownerOrganizer} />
  }

  if (publicEventsQuery.isLoading) {
    return (
      <Center py={{ base: 10, md: 16 }}>
        <Spinner color="whiteAlpha.600" />
      </Center>
    )
  }

  if (publicEventsQuery.isError) {
    return (
      <Center py={{ base: 10, md: 16 }}>
        <Stack gap={1} textAlign="center">
          <Text fontWeight="semibold">Impossible de charger le profil</Text>
          <Text color="gray.400" fontSize="sm">
            Reessayez dans quelques secondes.
          </Text>
        </Stack>
      </Center>
    )
  }

  return <OrganizerProfilPage organizer={visitorOrganizer} />
}

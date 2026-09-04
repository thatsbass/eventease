"use client"

import {
  Box,
  Button,
  Flex,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react"
import { useMemo, useState } from "react"
import type { Organizer, OrganizerTimelineEvent, OrganizerTimelineStatus } from "@/features/events/types/events.types"
import { TimelineRow } from "./public/event.timeline"
import { EventDrawer } from "./event.drawer"

type Props = {
  organizer: Organizer
}

export const EventPage = ({ organizer }: Props) => {
  const [statusFilter, setStatusFilter] = useState<OrganizerTimelineStatus>("UPCOMING")
  const [selectedEvent, setSelectedEvent] = useState<OrganizerTimelineEvent | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const events = useMemo(
    () => {
      const filtered = organizer.events.filter((event) => event.status === statusFilter)

      return filtered.slice().sort((a, b) => {
        const at = new Date(a.startAt).getTime()
        const bt = new Date(b.startAt).getTime()

        const aTime = Number.isNaN(at) ? Number.POSITIVE_INFINITY : at
        const bTime = Number.isNaN(bt) ? Number.POSITIVE_INFINITY : bt

        return statusFilter === "UPCOMING" ? aTime - bTime : bTime - aTime
      })
    },
    [organizer.events, statusFilter],
  )

  const handleSelectEvent = (event: OrganizerTimelineEvent) => {
    setSelectedEvent(event)
    setDrawerOpen(true)
  }


  return (
    <Box maxW="1100px" mx="auto" px={{ base: 4, md: 6 }} py={{ base: 5, md: 6 }}>
      <Flex
        align={{ base: "start", md: "center" }}
        justify="space-between"
        gap={4}
        mb={6}
        flexDirection={{ base: "column", md: "row" }}
      >
        <Stack gap={1}>
          <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="semibold" lineHeight="1.1">
            Evenements
          </Text>
          <Text color="gray.400" fontSize="sm">
            {organizer.name} - timeline par date
          </Text>
        </Stack>

        <HStack
          bg="whiteAlpha.100"
          border="1px solid"
          borderColor="whiteAlpha.200"
          borderRadius="lg"
          p={1}
        >
          <Button
            size="xs"
            bg={statusFilter === "UPCOMING" ? "whiteAlpha.300" : "transparent"}
            color={statusFilter === "UPCOMING" ? "gray.100" : "gray.400"}
            _hover={{ bg: "whiteAlpha.200" }}
            onClick={() => setStatusFilter("UPCOMING")}
          >
            A venir
          </Button>
          <Button
            size="xs"
            bg={statusFilter === "PAST" ? "whiteAlpha.300" : "transparent"}
            color={statusFilter === "PAST" ? "gray.100" : "gray.400"}
            _hover={{ bg: "whiteAlpha.200" }}
            onClick={() => setStatusFilter("PAST")}
          >
            Passes
          </Button>
        </HStack>
      </Flex>

      <Stack gap={6}>
        {events.map((event, index) => (
          <TimelineRow
            key={event.id}
            event={event}
            isLast={index === events.length - 1}
            isActive={drawerOpen && selectedEvent?.id === event.id}
            onSelect={handleSelectEvent}
          />
        ))}

        {events.length === 0 && (
          <Box
            bg="whiteAlpha.50"
            border="1px solid"
            borderColor="whiteAlpha.200"
            borderRadius="2xl"
            p={6}
          >
            <Text color="gray.300">Aucun evenement pour ce filtre.</Text>
          </Box>
        )}
      </Stack>
      <EventDrawer
        event={selectedEvent}
        organizer={organizer}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </Box>
  )
}

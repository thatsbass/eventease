"use client"

import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Image,
  Stack,
  Text,
} from "@chakra-ui/react"
import { type KeyboardEvent, type ReactNode } from "react"
import {
  MdLocationOn,
  MdOutlineGroups,
} from "react-icons/md"
import type {OrganizerTimelineEvent } from "@/features/events/types/events.types"


type TimelineRowProps = {
  event: OrganizerTimelineEvent
  isLast: boolean
  isActive?: boolean
  onSelect?: (event: OrganizerTimelineEvent) => void
}

export const TimelineRow = ({ event, isLast, isActive = false, onSelect }: TimelineRowProps) => {
  const invitedLabel = event.invitedCount <= 0
    ? "Aucun invite"
    : `${event.invitedCount} invite${event.invitedCount > 1 ? "s" : ""}`

  const handleKeyDown = (eventKey: KeyboardEvent<HTMLDivElement>) => {
    if (!onSelect) return
    if (eventKey.key === "Enter" || eventKey.key === " ") {
      eventKey.preventDefault()
      onSelect(event)
    }
  }

  const handleOpenDetails = () => {
    if (!onSelect) return
    onSelect(event)
  }

  return (
    <GridRow>
      <Stack gap={0} align={{ base: "start", md: "end" }} minW={{ md: "110px" }}>
        <Text fontSize={{ base: "md", md: "lg" }} fontWeight="semibold" lineHeight="1">
          {event.dateLabel}
        </Text>
        <Text color="gray.500" fontSize={{ base: "xs", md: "sm" }}>
          {event.weekday}
        </Text>
      </Stack>

      <Box
        w={{ base: "full", md: "28px" }}
        h={{ base: "24px", md: "100%" }}
        position="relative"
        display="flex"
        justifyContent="center"
      >
        {!isLast && (
          <Box
            position="absolute"
            top="16px"
            bottom="-24px"
            borderLeft="1px dashed"
            borderColor="whiteAlpha.200"
          />
        )}
        <Box
          mt="10px"
          w="8px"
          h="8px"
          borderRadius="full"
          bg="gray.400"
          border="1px solid"
          borderColor="gray.800"
          zIndex={1}
        />
      </Box>

      <Box
        bg={isActive ? "whiteAlpha.100" : "whiteAlpha.50"}
        border="1px solid"
        borderColor={isActive ? "whiteAlpha.400" : "whiteAlpha.200"}
        borderRadius="xl"
        py={2}
        px={4}
        w="full"
        maxW={{ base: "full", md: "720px" }}
        justifySelf={{ base: "stretch", md: "start" }}
        cursor={onSelect ? "pointer" : "default"}
        role={onSelect ? "button" : undefined}
        tabIndex={onSelect ? 0 : undefined}
        onClick={onSelect ? () => onSelect(event) : undefined}
        onKeyDown={onSelect ? handleKeyDown : undefined}
        transition="transform 0.15s ease, border-color 0.15s ease, background-color 0.15s ease"
        _hover={onSelect ? { transform: "translateY(-1px)", borderColor: "whiteAlpha.400" } : undefined}
      >
        <Flex justify="space-between" gap={3} direction={{ base: "column", md: "row" }}>
          <Stack gap={1}>
            <Text color="gray.400" fontSize={{ base: "sm", md: "lg" }}>
              {event.time}
            </Text>
            <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="semibold" lineHeight="1.15">
              {event.title}
            </Text>
            <HStack color="gray.400" fontSize="sm">
              <Icon as={MdLocationOn} />
              <Text>{event.location}</Text>
            </HStack>
            <HStack color="gray.500" fontSize="sm">
              <Icon as={MdOutlineGroups} />
              <Text>{invitedLabel}</Text>
            </HStack>

            <Button
              w={"150px"}
              size="xs"
              bg="whiteAlpha.200"
              color="gray.100"
              borderRadius="lg"
              _hover={{ bg: "whiteAlpha.300" }}
              disabled={!onSelect}
              onClick={(e) => {
                e.stopPropagation()
                handleOpenDetails()
              }}
            >
              Voir les details
            </Button>
          </Stack>

          <Box
            w={{ base: "100%", md: "130px" }}
            maxW="130px"
            h={{ base: "120px", md: "110px" }}
            borderRadius="xl"
            overflow="hidden"
            border="1px solid"
            borderColor="whiteAlpha.200"
            alignSelf={{ base: "start", md: "center" }}
          >
            <Image
              src={event.coverImage}
              alt={event.title}
              w="full"
              h="full"
              objectFit="cover"
            />
          </Box>
        </Flex>
      </Box>
    </GridRow>
  )
}

const GridRow = ({ children }: { children: ReactNode }) => {
  return (
    <Box
      display="grid"
      gridTemplateColumns={{ base: "1fr", md: "140px 28px 1fr" }}
      gap={{ base: 3, md: 3 }}
      alignItems="start"
    >
      {children}
    </Box>
  )
}

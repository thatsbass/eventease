"use client"

import {
  Badge,
  Box,
  HStack,
  Image,
  Input,
  Portal,
  Select,
  SimpleGrid,
  Stack,
  Text,
  VStack,
  createListCollection,
} from "@chakra-ui/react"
import { useMemo, useState } from "react"
import { EventDrawer } from "./event.drawer"
import type {
  Organizer,
  OrganizerTimelineEvent,
} from "@/features/events/types/events.types"
import { MdLocationOn } from "react-icons/md"
import { eventCategorySchema, type EventCategoryDto } from "@/features/events/schemas/events.schemas"

type DiscoverItem = {
  event: OrganizerTimelineEvent
  organizer: Organizer
  category: string
}

type Props = {
  items: DiscoverItem[]
}

type DiscoverCategoryFilter = "ALL" | EventCategoryDto
type DiscoverPriceFilter = "ALL" | "FREE" | "PAID"

const CATEGORY_LABELS: Record<DiscoverCategoryFilter, string> = {
  ALL: "Toutes",
  MUSIC: "Musique",
  TECH: "Tech",
  SPORTS: "Sports",
  BUSINESS: "Business",
  EDUCATION: "Education",
  ART: "Art",
  COMMUNITY: "Communautaire",
  OTHER: "Autre",
}

const PRICE_LABELS: Record<DiscoverPriceFilter, string> = {
  ALL: "Tous les prix",
  FREE: "Gratuit",
  PAID: "Payant",
}

const fallbackOrganizer: Organizer = {
  id: "",
  slug: "",
  name: "Organisateur",
  username: "",
  role: "Organisateur",
  timezone: "UTC",
  avatarUrl: "",
  isCertified: false,
  events: [],
}

export function DiscoverPage({ items }: Props) {
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<DiscoverCategoryFilter>("ALL")
  const [priceFilter, setPriceFilter] = useState<DiscoverPriceFilter>("ALL")
  const [selected, setSelected] = useState<DiscoverItem | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const categoryCollection = useMemo(
    () =>
      createListCollection({
        items: (["ALL", ...eventCategorySchema.options] as DiscoverCategoryFilter[]).map((value) => ({
          value,
          label: CATEGORY_LABELS[value],
        })),
      }),
    [],
  )
  const priceCollection = useMemo(
    () =>
      createListCollection({
        items: (["ALL", "FREE", "PAID"] as DiscoverPriceFilter[]).map((value) => ({
          value,
          label: PRICE_LABELS[value],
        })),
      }),
    [],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()

    const byFilters = items.filter((item) => {
      if (categoryFilter !== "ALL" && item.category !== categoryFilter) return false
      const hasPaidTicket = item.event.ticketTypes.some((ticket) => ticket.price > 0)
      if (priceFilter === "FREE" && hasPaidTicket) return false
      if (priceFilter === "PAID" && !hasPaidTicket) return false
      if (!q) return true

      const hay = [
        item.event.title,
        item.event.location,
        item.organizer.name,
        item.organizer.username,
      ]
        .join(" ")
        .toLowerCase()

      return hay.includes(q)
    })

    return byFilters.slice().sort((a, b) => {
      const at = new Date(a.event.startAt).getTime()
      const bt = new Date(b.event.startAt).getTime()

      const aTime = Number.isNaN(at) ? Number.POSITIVE_INFINITY : at
      const bTime = Number.isNaN(bt) ? Number.POSITIVE_INFINITY : bt

      return aTime - bTime
    })
  }, [items, categoryFilter, priceFilter, search])

  const handleSelectEvent = (event: OrganizerTimelineEvent) => {
    const match = items.find((item) => item.event.id === event.id) ?? null
    setSelected(match)
    setDrawerOpen(Boolean(match))
  }

  return (
    <Box maxW="1280px" mx="auto" px={{ base: 4, md: 6 }} py={{ base: 5, md: 6 }}>
      <Stack mb={10} maxW={"600px"}>
        <Text fontSize={"2xl"} fontWeight={"semibold"}>Découvrez les événements</Text>
        <Text fontSize={"14px"} color={"whiteAlpha.600"}>Explorez les événements populaires près de chez vous, parcourez les catégories.</Text>
      </Stack>
      <HStack gap={3} mb={8} align="stretch" flexWrap="wrap">
        <Input
          value={search}
          borderRadius={"full"}
          onChange={(e) => setSearch(e.target.value)}
          size="sm"
          h="40px"
          flex="1"
          minW={{ base: "100%", md: "360px" }}
          placeholder="Rechercher un evenement, un lieu ou un organisateur..."
          bg="whiteAlpha.100"
          px={4}
          borderColor="whiteAlpha.200"
          _placeholder={{ color: "whiteAlpha.600" }}
        />
        <Box
          bg="whiteAlpha.100"
          border="1px solid"
          borderColor="whiteAlpha.200"
          borderRadius="full"
          px={2.5}
          w={{ base: "100%", md: "250px" }}
        >
          <Select.Root
            collection={categoryCollection}
            value={[categoryFilter]}
            onValueChange={(details) => {
              const next = details.value[0]
              if (!next) return
              setCategoryFilter(next as DiscoverCategoryFilter)
            }}
          >
            <Select.HiddenSelect />
            <Select.Control>
              <Select.Trigger
                bg="transparent"
                border="none"
                px={0}
                py={0}
                h="28px"
                fontSize="sm"
                color="gray.100"
                _focusVisible={{ outline: "none", boxShadow: "none" }}
              >
                <Select.ValueText placeholder="Filtrer par categorie" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content
                  bg="rgba(18, 18, 20, 0.87)"
                  backdropFilter="blur(50px)"
                  color={"whiteAlpha.800"}
                  borderColor="whiteAlpha.300">
                  {categoryCollection.items.map((item) => (
                    <Select.Item item={item} key={item.value}>
                      {item.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
        </Box>
        <Box
          bg="whiteAlpha.100"
          border="1px solid"
          borderColor="whiteAlpha.200"
          borderRadius="full"
          px={2.5}
          w={{ base: "100%", md: "220px" }}
        >
          <Select.Root
            collection={priceCollection}
            value={[priceFilter]}
            onValueChange={(details) => {
              const next = details.value[0]
              if (!next) return
              setPriceFilter(next as DiscoverPriceFilter)
            }}
          >
            <Select.HiddenSelect />
            <Select.Control>
              <Select.Trigger
                bg="transparent"
                border="none"
                px={0}
                py={0}
                h="28px"
                fontSize="sm"
                color="gray.100"
                _focusVisible={{ outline: "none", boxShadow: "none" }}
              >
                <Select.ValueText placeholder="Prix" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content
                  bg="rgba(18, 18, 20, 0.87)"
                  backdropFilter="blur(50px)"
                  color={"whiteAlpha.800"}
                  borderColor="whiteAlpha.300">
                  {priceCollection.items.map((item) => (
                    <Select.Item item={item} key={item.value}>
                      {item.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
        </Box>
      </HStack>

      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={4}>
        {filtered.map((item) => {
          const firstTicket = item.event.ticketTypes[0]
          const priceLabel =
            firstTicket && firstTicket.price > 0
              ? `${firstTicket.price.toLocaleString("fr-FR")} ${firstTicket.currency}`
              : "Gratuit"

          return (
            <Box
              key={item.event.id}
              bg={drawerOpen && selected?.event.id === item.event.id ? "whiteAlpha.100" : "whiteAlpha.50"}
              border="1px solid"
              borderColor={drawerOpen && selected?.event.id === item.event.id ? "whiteAlpha.400" : "whiteAlpha.200"}
              borderRadius="2xl"
              overflow="hidden"
              cursor="pointer"
              onClick={() => handleSelectEvent(item.event)}
              transition="transform 0.15s ease, border-color 0.15s ease"
              _hover={{ transform: "translateY(-2px)", borderColor: "whiteAlpha.400" }}
            >
              <Image src={item.event.coverImage} alt={item.event.title} h="180px" w="full" objectFit="cover" />
              <Stack gap={3} p={4}>
                <HStack justify="space-between" align="start">
                  <Badge bg="whiteAlpha.200" color="gray.100" borderRadius="full" px={2.5} py={1}>
                    {CATEGORY_LABELS[item.category as EventCategoryDto]}
                  </Badge>
                  <Text fontSize="xs" color="gray.400">
                    {item.event.time}
                  </Text>
                </HStack>

                <Text fontSize="lg" fontWeight="semibold" lineHeight="1.2" lineClamp={2}>
                  {item.event.title}
                </Text>

                <Text fontSize="sm" color="gray.300" lineClamp={1}>
                  {item.event.weekday} {item.event.dateLabel}
                </Text>

                <HStack color="gray.400" fontSize="sm">
                  <MdLocationOn />
                  <Text lineClamp={1}>{item.event.location}</Text>
                </HStack>

                <HStack justify="space-between" pt={1}>
                  <Text color="gray.400" fontSize="xs">
                    A partir de
                  </Text>
                  <Text fontWeight="semibold">{priceLabel}</Text>
                </HStack>
              </Stack>
            </Box>
          )
        })}
      </SimpleGrid>

      {filtered.length === 0 && (
        <Box
          mt={6}
          bg="whiteAlpha.50"
          border="1px solid"
          borderColor="whiteAlpha.200"
          borderRadius="2xl"
          p={6}
        >
          <Text color="gray.300">Aucun evenement ne correspond a votre recherche.</Text>
        </Box>
      )}

      <EventDrawer
        event={selected?.event ?? null}
        organizer={selected?.organizer ?? fallbackOrganizer}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </Box>
  )
}

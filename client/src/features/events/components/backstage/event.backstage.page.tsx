"use client"

import {
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  HStack,
  Icon,
  IconButton,
  Image,
  Input,
  InputGroup,
  SimpleGrid,
  Stack,
  Text,
  Tabs,
  Link,
  Avatar,
} from "@chakra-ui/react"
import { useRef, useState, type ChangeEvent } from "react"
import {
  MdAdd,
  MdArchive,
  MdArrowOutward,
  MdBarChart,
  MdCampaign,
  MdCalendarToday,
  MdClose,
  MdDelete,
  MdDownload,
  MdEdit,
  MdFilterList,
  MdInsights,
  MdLink,
  MdListAlt,
  MdLocationOn,
  MdOutlineGroups,
  MdOutlineHowToReg,
  MdPersonAdd,
  MdQrCode2,
  MdSearch,
  MdSettings,
  MdShare,
  MdCelebration,
  MdDescription,
  MdOutlineConfirmationNumber,
} from "react-icons/md"
import type { Organizer, OrganizerTimelineEvent, TicketType } from "@/features/events/types/events.types"
import { getDateLabelParts } from "@/features/events/utils/date-label"
import { EventUrlClipboard } from "../event.clipboard"
import config from "@/config/environment"
import BackToPage from "@/components/shared/back-to-page"
import type { EventDto } from "@/features/events/schemas/events.schemas"
import type { CreateTicketTypeRequest, UpdateEventRequest } from "@/features/events/schemas/events.requests"
import { EditEventDrawer } from "./edit-event.drawer"
import { CancelEventDialog } from "./cancel-event.dialog"
import { CreateTicketTypeDialog } from "./create-ticket-type.dialog"
import { EventCapacityDialog } from "./event-capacity.dialog"
import { EditTicketTypeDialog } from "./edit-ticket-type.dialog"
import { DeleteTicketTypeDialog } from "./delete-ticket-type.dialog"

type Props = {
  event: OrganizerTimelineEvent
  organizer: Organizer
  eventDto: EventDto
  onUploadCover?: (file: File) => void
  isUploadingCover?: boolean
  onUpdateEvent?: (values: UpdateEventRequest) => Promise<unknown> | unknown
  isUpdatingEvent?: boolean
  onPublish?: () => void
  onUnpublish?: () => void
  isPublishing?: boolean
  onCancelEvent?: () => Promise<unknown> | unknown
  isCancellingEvent?: boolean
  onCreateTicketType?: (values: CreateTicketTypeRequest) => Promise<unknown> | unknown
  isCreatingTicketType?: boolean
  onUpdateTicketType?: (ticketTypeId: string, values: CreateTicketTypeRequest) => Promise<unknown> | unknown
  isUpdatingTicketType?: boolean
  onDeleteTicketType?: (ticketTypeId: string) => Promise<unknown> | unknown
  isDeletingTicketType?: boolean
}

type InviteStatus = "Participe" | "Invite" | "En attente"

type Invite = {
  id: string
  name: string
  email: string
  status: InviteStatus
  ticket: string
  registeredAt: string
}

const PANEL_STYLES = {
  // bg: "whiteAlpha.100",
  border: "1px solid",
  borderColor: "whiteAlpha.200",
  borderRadius: "xl",
} as const

const ACTION_BUTTON_STYLES = {
  bg: "whiteAlpha.100",
  border: "1px solid",
  borderColor: "whiteAlpha.200",
  borderRadius: "xl",
  justifyContent: "flex-start",
  h: "64px",
  px: 4,
  color: "gray.100",
  _hover: { bg: "whiteAlpha.200" },
} as const

const SUBTLE_BUTTON_STYLES = {
  bg: "whiteAlpha.100",
  border: "1px solid",
  borderColor: "whiteAlpha.200",
  borderRadius: "full",
  color: "gray.100",
  _hover: { bg: "whiteAlpha.200" },
} as const

const STATS = [
  { id: "STAT-1", label: "Participants", value: "18", delta: "+12% vs semaine" },
  { id: "STAT-2", label: "Taux de presence", value: "72%", delta: "+6%" },
  { id: "STAT-3", label: "Ventes billets", value: "1.8M XOF", delta: "+4%" },
  { id: "STAT-4", label: "Ouverture emails", value: "58%", delta: "+9%" },
]

const formatCurrency = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${amount.toLocaleString("fr-FR")} ${currency}`
  }
}

export const EventBackstagePage = ({
  event,
  organizer,
  eventDto,
  onUploadCover,
  isUploadingCover,
  onUpdateEvent,
  isUpdatingEvent,
  onPublish,
  onUnpublish,
  isPublishing,
  onCancelEvent,
  isCancellingEvent,
  onCreateTicketType,
  isCreatingTicketType,
  onUpdateTicketType,
  isUpdatingTicketType,
  onDeleteTicketType,
  isDeletingTicketType,
}: Props) => {
  const coverInputRef = useRef<HTMLInputElement | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isCancelOpen, setIsCancelOpen] = useState(false)
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false)
  const [isCapacityOpen, setIsCapacityOpen] = useState(false)
  const [editingTicket, setEditingTicket] = useState<TicketType | null>(null)
  const [deletingTicket, setDeletingTicket] = useState<TicketType | null>(null)

  const handlePickCover = () => {
    coverInputRef.current?.click()
  }

  const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    e.target.value = ""
    onUploadCover?.(file)
  }

  const { dateDay, dateMonth } = getDateLabelParts(event.dateLabel)
  const isPublished = event.publicStatus === "PUBLISHED"
  const isCancelled = event.publicStatus === "CANCELLED"
  const statusLabel = isCancelled ? "Annule" : isPublished ? "Publie" : "Brouillon"
  const frontUrl = config.NEXT_PUBLIC_FRONT_URL ?? ""
  const shareLink = frontUrl ? `${frontUrl}/events/${event.publicId}` : `/events/${event.publicId}`
  const capacity = eventDto.capacity
  const hasCapacityLimit = typeof capacity === "number"
  const participatingCount = 3;
  const progress =
    typeof capacity === "number" && capacity > 0 ? Math.min(100, Math.round((participatingCount / capacity) * 100)) : 0
  const tickets = event.ticketTypes
  const defaultTicketCurrency = eventDto.ticketTypes[0]?.currency ?? "XOF"
  const organizerEmail = organizer.username ? `${organizer.username}@gmail.com` : "contact@event.com"

  return (
    <Box maxW="1200px" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 6, md: 8 }}>
      <Stack gap={6}>
        <HStack color="gray.500" fontSize="sm">
          <BackToPage />
        </HStack>
        <Flex
          align={{ base: "start", md: "center" }}
          justify="space-between"
          gap={4}
          flexDirection={{ base: "column", md: "row" }}
        >
          <Stack gap={2}>

            <HStack flexWrap="wrap" gap={3} justify={"flex-start"}>
              <Text maxW={"500px"} fontSize={{ base: "2xl", md: "2xl" }} fontWeight="semibold">
                {event.title}
              </Text>
              <Badge
                bg={isCancelled ? "red.500" : isPublished ? "green.900" : "whiteAlpha.200"}
                color="white"
                borderRadius="full"
                px={4}
                py={2}
                fontSize="xs"
              >
                {statusLabel}
                {isCancelled ? null : isPublished ? <MdCelebration size={14} /> : <MdArchive size={14} />}

              </Badge>
              {!isCancelled ? (
                isPublished ? (
                  <Button
                    size="xs"
                    {...SUBTLE_BUTTON_STYLES}
                    onClick={onUnpublish}
                    loading={Boolean(isPublishing)}
                    disabled={!onUnpublish}
                  >
                    Mettre en brouillon
                  </Button>
                ) : (
                  <Button
                    size="xs"
                    bg="green.500"
                    border="1px solid"
                    borderColor="green.500"
                    borderRadius="full"
                    color="white"
                    _hover={{ bg: "green.400" }}
                    onClick={onPublish}
                    loading={Boolean(isPublishing)}
                    disabled={!onPublish}
                  >
                    Publier
                  </Button>
                )
              ) : null}
            </HStack>

          </Stack>

          <HStack gap={3} flexWrap="wrap">
            {/* {isPublished && shareLink ? <EventUrlClipboard value={shareLink} /> : null} */}
            {isPublished ? (
              <Link href={`/events/${event.publicId}`} target="_blank" _hover={{ textDecoration: "none" }}>
                <Button size="sm" {...SUBTLE_BUTTON_STYLES}>
                  Page de l'evenement <MdArrowOutward />
                </Button>
              </Link>
            ) : (
              <Button size="sm" {...SUBTLE_BUTTON_STYLES} disabled>
                Page de l'evenement
              </Button>
            )}
          </HStack>
        </Flex>

        <Tabs.Root defaultValue="overview" variant="line" colorPalette="fg.muted">
          <Tabs.List
            gap={{ base: 4, md: 6 }}
            borderBottom="1px solid"
            borderColor="whiteAlpha.200"
            overflowX="auto"
            className="hidden-scroll"
          >
            <Tabs.Trigger value="overview" color="gray.400" _selected={{ color: "white" }}>
              Apercu
            </Tabs.Trigger>
            <Tabs.Trigger value="guests" color="gray.400" _selected={{ color: "white" }}>
              Invites
            </Tabs.Trigger>
            <Tabs.Trigger value="registration" color="gray.400" _selected={{ color: "white" }}>
              Inscription
            </Tabs.Trigger>
            <Tabs.Trigger value="stats" color="gray.400" _selected={{ color: "white" }}>
              Statistiques
            </Tabs.Trigger>
            <Tabs.Trigger value="more" color="gray.400" _selected={{ color: "white" }}>
              Plus
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="overview">
            <Stack gap={6}>
              <Grid templateColumns={{ base: "1fr", xl: "1.2fr 0.8fr" }} gap={4} alignItems="stretch">
                {/* CHILD 1 */}
                <Box
                  borderRadius="2xl"
                  border="1px solid"
                  borderColor="whiteAlpha.100"
                  p={4}
                  h={{ base: "auto", xl: "full" }}
                  display="flex"
                  flexDirection="column"
                >
                  {/* TOP WITH IMAGE */}
                  <Flex direction={{ base: "column", md: "row" }} gap={4} flex="1">
                    <Box
                      w={{ base: "full", md: "200px" }}
                      h={{ base: "200px", md: "160px" }}
                      borderRadius="xl"
                      overflow="hidden"
                      border="1px solid"
                      borderColor="whiteAlpha.200"
                      bg="whiteAlpha.100"
                    >
                      <Image src={event.coverImage} alt={event.title} w="full" h="full" objectFit="cover" />
                    </Box>
                    <Stack flex="1" gap={3} color="whiteAlpha.900"  >
                      <Stack gap={2}>
                        <Text fontSize="xl" fontWeight="semibold">
                          {event.title}
                        </Text>
                        <Text fontSize="xs" color={"whiteAlpha.700"}>
                          {event.description ?? "Aucune description"}
                        </Text>

                      </Stack>

                      <Stack gap={2} fontSize="sm" hidden>
                        <Text color="whiteAlpha.700">Presente par</Text>
                        <HStack gap={2}>
                          <Box
                            w="28px"
                            h="28px"
                            borderRadius="full"
                            bg="whiteAlpha.200"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontWeight="bold"
                          >
                            {organizer.name.slice(0, 1)}
                          </Box>
                          <Text>{organizer.name}</Text>
                        </HStack>
                      </Stack>

                      <Box
                      >
                        <HStack gap={2} flexWrap="wrap">
                          <Button
                            size="sm"
                            {...SUBTLE_BUTTON_STYLES}
                            onClick={handlePickCover}
                            loading={isUploadingCover}
                            disabled={!onUploadCover}
                          >
                            Changer la photo
                          </Button>

                          <Button
                            size="sm"
                            {...SUBTLE_BUTTON_STYLES}
                            onClick={() => setIsEditOpen(true)}
                            disabled={!onUpdateEvent}
                          >
                            Modifier l'evenement
                          </Button>
                          <input
                            ref={coverInputRef}
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={handleCoverChange}
                          />

                        </HStack>
                      </Box>
                    </Stack>
                  </Flex>
                  {/* Bottom */}
                  <Flex
                    justify="space-between"
                    align={{ base: "start", md: "center" }}
                    gap={3}
                    mt={4}
                    flexDirection={{ base: "column", md: "row" }}

                  >
                    <HStack gap={2}>
                      <IconButton aria-label="Partager" size="sm" {...SUBTLE_BUTTON_STYLES}>
                        <MdShare />
                      </IconButton>
                      <IconButton aria-label="Copier le lien" size="sm" {...SUBTLE_BUTTON_STYLES}>
                        <MdLink />
                      </IconButton>
                      <Text fontSize="xs" color="gray.500">
                        Partager l'evenement
                      </Text>
                    </HStack>
                    <HStack hidden gap={2} flexWrap="wrap">
                      <Button
                        size="sm"
                        {...SUBTLE_BUTTON_STYLES}
                        onClick={() => setIsEditOpen(true)}
                        disabled={!onUpdateEvent}
                      >
                        Modifier l'evenement
                      </Button>
                      <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleCoverChange}
                      />
                      <Button
                        size="sm"
                        {...SUBTLE_BUTTON_STYLES}
                        onClick={handlePickCover}
                        loading={isUploadingCover}
                        disabled={!onUploadCover}
                      >
                        Changer la photo
                      </Button>
                    </HStack>
                  </Flex>
                </Box>
                {/* CHILD 2 */}
                <Stack gap={4} h={{ base: "auto", xl: "full" }}>
                  <Box {...PANEL_STYLES} p={4} h={{ base: "auto", xl: "full" }}>
                    <Stack gap={3} h="full">
                      <Text fontWeight="semibold" color="gray.100">
                        Quand et ou
                      </Text>
                      <HStack gap={3}>
                        <Box
                          minW="52px"
                          textAlign="center"
                          borderRadius="lg"
                          bg="whiteAlpha.100"
                          px={2}
                          py={2}
                        >
                          <Text fontSize="xs" color="gray.400">
                            {dateMonth || event.dateLabel.toUpperCase()}
                          </Text>
                          <Text fontSize="lg" fontWeight="semibold" color="gray.100">
                            {dateDay}
                          </Text>
                        </Box>
                        <Stack gap={0}>
                          <Text fontSize="sm" color="gray.100">
                            {event.weekday} {event.dateLabel}
                          </Text>
                          <Text fontSize="xs" color="gray.400">
                            {event.time} UTC
                          </Text>
                        </Stack>
                      </HStack>
                      <HStack gap={2} color="gray.300" fontSize="sm">
                        <Icon as={MdLocationOn} />
                        <Stack gap={0}>
                          <Text>{event.location}</Text>
                          <Text fontSize="xs" color="gray.500">
                            Dakar, Senegal
                          </Text>
                        </Stack>
                      </HStack>
                      <Text fontSize="sm" color="gray.400">
                        L'adresse est affichee publiquement sur la page de l'evenement avec le Google Maps.
                      </Text>
                    </Stack>
                  </Box>
                </Stack>
              </Grid>
              {/* ADD AGENT SECTION */}
              <Box {...PANEL_STYLES} p={4}>
                <Flex justify="space-between" align="center" gap={3} flexWrap="wrap">
                  <Text fontWeight="semibold">Organisateurs</Text>
                  <Button size="sm" {...SUBTLE_BUTTON_STYLES}>
                    <HStack gap={2}>
                      <MdAdd />
                      <Text>Ajouter un agent</Text>
                    </HStack>
                  </Button>
                </Flex>
                <Box
                  mt={4}
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="whiteAlpha.100"
                  bg="whiteAlpha.50"
                  p={3}
                >
                  <Flex justify="space-between" align="center" gap={3} flexWrap="wrap">
                    <HStack gap={3} minW="240px">
                      <Avatar.Root size="lg">
                        <Avatar.Fallback name={organizer.name.slice(0, 1)} />
                        <Avatar.Image src={organizer.avatarUrl ?? null} />
                      </Avatar.Root>
                      <HStack gap={2} flexWrap="wrap">
                        <Text fontWeight="semibold">{organizer.name}</Text>
                        <Text color="gray.400" fontSize="sm">
                          {organizerEmail}
                        </Text>
                        <Badge bg="gray.500" color="gray.300" px={2} fontSize="xs">
                          Createur
                        </Badge>
                      </HStack>
                    </HStack>
                    <IconButton aria-label="Modifier" size="sm" {...SUBTLE_BUTTON_STYLES}>
                      <MdEdit />
                    </IconButton>
                  </Flex>
                </Box>
                <HStack gap={2} mt={3} color="gray.500" fontSize="sm">
                  <Icon as={MdOutlineGroups} />
                  <Text>Gerer le personnel et les options d'enregistrement</Text>
                </HStack>
              </Box>
            </Stack>
          </Tabs.Content>

          <Tabs.Content value="guests">
            <Stack gap={6}>
              <Box {...PANEL_STYLES} p={4}>
                <Flex justify="space-between" align="center" gap={3} flexWrap="wrap">
                  <Stack gap={1}>
                    <Text fontWeight="semibold">Apercu</Text>
                    <HStack gap={2} >
                      {/* <Box w="8px" h="8px" borderRadius="full" bg="whiteAlpha.800" /> */}
                      <Text fontSize="sm" color="whiteAlpha.600">{participatingCount} participe</Text>
                    </HStack>
                  </Stack>
                  <Text color="whiteAlpha.600">{hasCapacityLimit ? `capacite ${capacity}` : "capacite illimitee"}</Text>
                </Flex>
                {hasCapacityLimit ? (
                  <Box mt={3} bg="whiteAlpha.100" borderRadius="full" h="8px">
                    <Box bg="whiteAlpha.500" h="full" w={`${progress}%`} borderRadius="full" />
                  </Box>
                ) : null}
              </Box>

              <SimpleGrid columns={{ base: 1, md: 3 }} gap={3}>
                <Button {...ACTION_BUTTON_STYLES}>
                  <HStack gap={3}>
                    <Box
                      w="36px"
                      h="36px"
                      borderRadius="lg"
                      bg="blue.600"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon as={MdPersonAdd} color="blue.300" />
                    </Box>
                    <Stack gap={0} align="start">
                      <Text fontWeight="semibold">Inviter des participants</Text>
                      <Text fontSize="xs" color="gray.400">
                        Email et SMS
                      </Text>
                    </Stack>
                  </HStack>
                </Button>
                <Button {...ACTION_BUTTON_STYLES}>
                  <HStack gap={3}>
                    <Box
                      w="36px"
                      h="36px"
                      borderRadius="lg"
                      bg="green.600"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon as={MdQrCode2} color="green.300" />
                    </Box>
                    <Stack gap={0} align="start">
                      <Text fontWeight="semibold">Enregistrer les invites</Text>
                      <Text fontSize="xs" color="gray.400">
                        Scan rapide
                      </Text>
                    </Stack>
                  </HStack>
                </Button>
                <Button {...ACTION_BUTTON_STYLES}>
                  <HStack gap={3}>
                    <Box
                      w="36px"
                      h="36px"
                      borderRadius="lg"
                      bg="pink.600"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon as={MdListAlt} color="pink.300" />
                    </Box>
                    <Stack gap={0} align="start">
                      <Text fontWeight="semibold">Liste des invites</Text>
                      <Text fontSize="xs" color="gray.400">
                        Filtrer et exporter
                      </Text>
                    </Stack>
                  </HStack>
                </Button>
              </SimpleGrid>
            </Stack>
          </Tabs.Content>

          <Tabs.Content value="registration">
            <Stack gap={6}>
              <SimpleGrid columns={{ base: 1, md: 3 }} gap={3}>
                <Box  py={4}>
                  <Flex justify="space-between" align="center" gap={4}>

                    {/* LEFT - Infos */}
                    <HStack gap={3}>
                      <Box
                        w="40px"
                        h="40px"
                        borderRadius="lg"
                        bg="whiteAlpha.200"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Icon as={MdOutlineGroups} color="whiteAlpha.600" />
                      </Box>

                      <Stack gap={0}>
                        <Text fontWeight="semibold">
                          Capacite de l'evenement
                        </Text>
                        <Text fontSize="sm" color="gray.400">
                          {typeof capacity === "number"
                            ? `${capacity} participants`
                            : "Illimitee"}
                        </Text>
                      </Stack>
                    </HStack>

                    {/* RIGHT - Button */}
                    <Button
                      size="sm"
                      onClick={() => setIsCapacityOpen(true)}
                      disabled={!onUpdateEvent}
                      {...SUBTLE_BUTTON_STYLES}
                    >
                      Gerer
                    </Button>

                  </Flex>
                </Box>
              </SimpleGrid>


              <Flex justify="space-between" align="center" gap={3} flexWrap="wrap">
                <Text fontSize="xl" fontWeight="semibold">
                  Billets
                </Text>
                <HStack gap={2}>
                  <Button
                    size="sm"
                    {...SUBTLE_BUTTON_STYLES}
                    onClick={() => setIsCreateTicketOpen(true)}
                    disabled={!onCreateTicketType}
                  >
                    <HStack gap={2}>
                      <MdAdd />
                      <Text>Nouveau type de billet</Text>
                    </HStack>
                  </Button>
                </HStack>
              </Flex>

              <Box
                borderRadius="xl"
                border="1px solid"
                borderColor="whiteAlpha.200"
                bg="whiteAlpha.50"
                p={4}
              >
                <Flex justify="space-between" align="center" gap={3} flexWrap="wrap">
                  <HStack gap={3}>
                    <Box
                      w="40px"
                      h="40px"
                      borderRadius="full"
                      bg="whiteAlpha.200"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontWeight="bold"
                      color="white"
                    >
                      <Image borderRadius={"full"} src={"https://cdn.iconscout.com/icon/free/png-256/free-stripe-logo-icon-svg-download-png-498440.png"} />
                    </Box>
                    <Stack gap={1}>
                      <Text fontWeight="semibold">Commencer a vendre</Text>
                      <Text fontSize="sm" color="gray.400">
                        Collectez les paiements en creant un compte Stripe.
                      </Text>
                    </Stack>
                  </HStack>
                  <HStack gap={2}>
                    <Button size="sm" {...SUBTLE_BUTTON_STYLES}>
                      Commencer
                    </Button>
                    <IconButton aria-label="Fermer" size="sm" {...SUBTLE_BUTTON_STYLES}>
                      <MdClose />
                    </IconButton>
                  </HStack>
                </Flex>
              </Box>

              <Box
                borderRadius="xl"
                border="1px solid"
                borderColor="whiteAlpha.200"
                bg="whiteAlpha.50"
                overflow="hidden"
              >
                <Stack gap={0}>
                  {tickets.length === 0 && (
                    <Box p={4}>
                      <Text fontSize="sm" color="gray.400">
                        Aucun billet configure pour cet evenement.
                      </Text>
                    </Box>
                  )}
                  {tickets.map((ticket, index) => {
                    const isVip = ticket.tier === "vip"
                    const priceLabel = ticket.price <= 0 ? "Gratuit" : formatCurrency(ticket.price, ticket.currency)

                    return (
                      <Flex
                        key={ticket.id}
                        align="center"
                        justify="space-between"
                        gap={3}
                        px={4}
                        py={3}
                        borderTop={index === 0 ? "none" : "1px solid"}
                        borderColor="whiteAlpha.200"
                        flexWrap="wrap"
                      >
                        <HStack gap={2} flexWrap="wrap">
                          <MdOutlineConfirmationNumber size={20} />
                          <Text fontWeight="semibold">{ticket.name}</Text>
                          <Text color="gray.400">{priceLabel}</Text>
                          {isVip && (
                            <Badge
                              bg="yellow.900"
                              color="yellow.200"
                              borderRadius="full"
                              px={2}
                              py={1}
                              fontSize="xs"
                            >
                              Validation requise
                            </Badge>
                          )}
                        </HStack>
                        <HStack gap={2} flexWrap="wrap">
                          <HStack gap={2} color="gray.400">
                            <Icon as={MdOutlineGroups} />
                            <Text>
                              {ticket.sold}/{ticket.quantity}
                            </Text>
                          </HStack>
                          <IconButton
                            aria-label="Modifier billet"
                            size="sm"
                            {...SUBTLE_BUTTON_STYLES}
                            onClick={() => setEditingTicket(ticket)}
                            disabled={!onUpdateTicketType}
                          >
                            <MdEdit />
                          </IconButton>
                          <IconButton
                            aria-label="Supprimer billet"
                            size="sm"
                            {...SUBTLE_BUTTON_STYLES}
                            onClick={() => setDeletingTicket(ticket)}
                            disabled={!onDeleteTicketType || ticket.sold > 0}
                          >
                            <MdDelete />
                          </IconButton>
                        </HStack>
                      </Flex>
                    )
                  })}
                </Stack>
              </Box>
            </Stack>
          </Tabs.Content>


          <Tabs.Content value="stats">
            <Stack gap={6}>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                {STATS.map((stat) => (
                  <Box key={stat.id} {...PANEL_STYLES} p={4}>
                    <HStack justify="space-between" align="center">
                      <Text fontSize="sm" color="gray.400">
                        {stat.label}
                      </Text>
                      <Icon as={MdInsights} color="green.300" />
                    </HStack>
                    <Text fontSize="2xl" fontWeight="semibold" mt={2}>
                      {stat.value}
                    </Text>
                    <Text fontSize="xs" color="green.400">
                      {stat.delta}
                    </Text>
                  </Box>
                ))}
              </SimpleGrid>

              <Box {...PANEL_STYLES} p={4}>
                <Flex justify="space-between" align="center" gap={3} flexWrap="wrap">
                  <Stack gap={1}>
                    <Text fontWeight="semibold">Performance generale</Text>
                    <Text fontSize="sm" color="gray.400">
                      Suivi des conversions et de la communication.
                    </Text>
                  </Stack>
                  <Button size="sm" {...SUBTLE_BUTTON_STYLES}>
                    <HStack gap={2}>
                      <MdBarChart />
                      <Text>Voir le rapport</Text>
                    </HStack>
                  </Button>
                </Flex>
                <Box
                  mt={4}
                  borderRadius="xl"
                  border="1px dashed"
                  borderColor="whiteAlpha.200"
                  bg="whiteAlpha.50"
                  p={6}
                  textAlign="center"
                  color="gray.500"
                  fontSize="sm"
                >
                  Graphe des performances a integrer.
                </Box>
              </Box>
            </Stack>
          </Tabs.Content>

          <Tabs.Content value="more">
            <Stack gap={6}>
              <Box {...PANEL_STYLES} p={4}>
                <Stack gap={4}>
                  <HStack justify="space-between" align="center">
                    <Text fontWeight="semibold">Parametres de l'evenement</Text>
                    <Icon as={MdSettings} color="gray.400" />
                  </HStack>
                  <Flex justify="space-between" align="center" gap={3} flexWrap="wrap">
                    <Stack gap={1}>
                      <Text fontWeight="semibold">Visibilite</Text>
                      <Text fontSize="sm" color="gray.400">
                        {isCancelled ? "Evenement annule" : isPublished ? "Evenement public" : "Evenement prive"}
                      </Text>
                    </Stack>
                    {!isCancelled ? (
                      isPublished ? (
                        <Button
                          size="sm"
                          {...SUBTLE_BUTTON_STYLES}
                          onClick={onUnpublish}
                          loading={Boolean(isPublishing)}
                          disabled={!onUnpublish}
                        >
                          Mettre en brouillon
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          {...SUBTLE_BUTTON_STYLES}
                          onClick={onPublish}
                          loading={Boolean(isPublishing)}
                          disabled={!onPublish}
                        >
                          Publier
                        </Button>
                      )
                    ) : (
                      <Button size="sm" {...SUBTLE_BUTTON_STYLES} disabled>
                        Annule
                      </Button>
                    )}
                  </Flex>
                  <Flex justify="space-between" align="center" gap={3} flexWrap="wrap">
                    <Stack gap={1}>
                      <Text fontWeight="semibold">Communication</Text>
                      <Text fontSize="sm" color="gray.400">
                        Emails automatiques et rappels
                      </Text>
                    </Stack>
                    <Button size="sm" {...SUBTLE_BUTTON_STYLES}>
                      Configurer
                    </Button>
                  </Flex>
                </Stack>
              </Box>

              <Box {...PANEL_STYLES} p={4}>
                <Stack gap={4}>
                  <Text fontWeight="semibold">Actions rapides</Text>
                  <SimpleGrid columns={{ base: 1, md: 3 }} gap={3}>

                    <Button {...ACTION_BUTTON_STYLES}>
                      <HStack gap={3}>
                        <Box
                          w="36px"
                          h="36px"
                          borderRadius="lg"
                          bg="whiteAlpha.200"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Icon as={MdArchive} color="gray.200" />
                        </Box>
                        <Text fontWeight="semibold">Archiver</Text>
                      </HStack>
                    </Button>
                    <Button
                      {...ACTION_BUTTON_STYLES}
                      bg="orange.500"
                      borderColor="orange.500"
                      _hover={{ bg: "orange.400" }}
                      onClick={() => setIsCancelOpen(true)}
                      disabled={isCancelled || !onCancelEvent}
                    >
                      <HStack gap={3}>
                        <Box
                          w="36px"
                          h="36px"
                          borderRadius="lg"
                          bg="whiteAlpha.200"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Icon as={MdClose} color="white" />
                        </Box>
                        <Text fontWeight="semibold">Annuler</Text>
                      </HStack>
                    </Button>
                    <Button
                      {...ACTION_BUTTON_STYLES}
                      bg="red.500"
                      borderColor="red.500"
                      _hover={{ bg: "red.400" }}
                    >
                      <HStack gap={3}>
                        <Box
                          w="36px"
                          h="36px"
                          borderRadius="lg"
                          bg="whiteAlpha.200"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Icon as={MdDelete} color="white" />
                        </Box>
                        <Text fontWeight="semibold">Supprimer</Text>
                      </HStack>
                    </Button>
                  </SimpleGrid>
                </Stack>
              </Box>
            </Stack>
          </Tabs.Content>
        </Tabs.Root>
      </Stack>

      <EditEventDrawer
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        event={eventDto}
        onSubmit={onUpdateEvent}
        isSubmitting={isUpdatingEvent}
      />

      <CancelEventDialog
        open={isCancelOpen}
        onOpenChange={setIsCancelOpen}
        eventTitle={event.title}
        onConfirm={onCancelEvent}
        isConfirming={isCancellingEvent}
      />

      <CreateTicketTypeDialog
        open={isCreateTicketOpen}
        onOpenChange={setIsCreateTicketOpen}
        defaultCurrency={defaultTicketCurrency}
        onSubmit={onCreateTicketType}
        isSubmitting={isCreatingTicketType}
      />

      <EventCapacityDialog
        open={isCapacityOpen}
        onOpenChange={setIsCapacityOpen}
        initialCapacity={capacity}
        onSubmit={onUpdateEvent ? (nextCapacity) => onUpdateEvent({ capacity: nextCapacity }) : undefined}
        isSubmitting={isUpdatingEvent}
      />

      {editingTicket ? (
        <EditTicketTypeDialog
          open={Boolean(editingTicket)}
          onOpenChange={(open) => {
            if (!open) setEditingTicket(null)
          }}
          ticket={editingTicket}
          onSubmit={onUpdateTicketType ? (values) => onUpdateTicketType(editingTicket.id, values) : undefined}
          isSubmitting={isUpdatingTicketType}
        />
      ) : null}

      {deletingTicket ? (
        <DeleteTicketTypeDialog
          open={Boolean(deletingTicket)}
          onOpenChange={(open) => {
            if (!open) setDeletingTicket(null)
          }}
          ticketName={deletingTicket.name}
          ticketSold={deletingTicket.sold}
          onConfirm={onDeleteTicketType ? () => onDeleteTicketType(deletingTicket.id) : undefined}
          isConfirming={isDeletingTicketType}
        />
      ) : null}
    </Box>
  )
}

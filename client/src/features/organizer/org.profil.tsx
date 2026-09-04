'use client'

import {
    Box,
    Button,
    Flex,
    Grid,
    HStack,
    Icon,
    IconButton,
    Image,
    Stack,
    Text,
} from "@chakra-ui/react"
import {
    MdAdd,
    MdAddAPhoto,
    MdArrowOutward,
    MdChevronLeft,
    MdChevronRight,
    MdSearch,
} from "react-icons/md"
import { TimelineRow } from "@/features/events/components/public/event.timeline"
import type { Organizer, OrganizerTimelineEvent, OrganizerTimelineStatus } from "@/features/events/types/events.types"
import { LocationMap } from "../events/components/public/public.location-map"
import { useMemo, useRef, useState, type ChangeEvent } from "react"
import { EventDrawer } from "../events/components/event.drawer"
import { useRouter } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toaster } from "@/components/ui/toaster"
import { ApiError } from "@/lib/api/client"
import { authApi } from "@/features/auth/api/auth.api"
import { useAuthHydrated } from "@/features/auth/hooks/use-auth-hydrated"
import { useAuthUser } from "@/features/auth/hooks/use-auth-user"
import type { AuthUser } from "@/features/auth/schemas/auth.schemas"
import { profileApi } from "@/features/profile/api/profile.api"

const panelStyles = {
    bg: "whiteAlpha.50",
    border: "1px solid",
    borderColor: "whiteAlpha.200",
    borderRadius: "xl",
} as const

const iconButtonStyles = {
    ...panelStyles,
    w: "34px",
    h: "34px",
    color: "gray.300",
    _hover: { bg: "whiteAlpha.200" },
} as const

const weekDays = ["L", "M", "M", "J", "V", "S", "D"]
const calendarDays = [
    "",
    "",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "20",
    "21",
    "22",
    "23",
    "24",
    "25",
    "26",
    "27",
    "28",
]

const DEFAULT_ORGANIZER_COVER_IMAGE =
    "https://res.cloudinary.com/dv9az7nno/image/upload/v1770269612/default-cover_mksocd.avif"

const getErrorMessage = (err: unknown) => {
    if (err instanceof ApiError) return err.message || "Une erreur est survenue"
    if (err instanceof Error) return err.message || "Une erreur est survenue"
    return "Une erreur est survenue"
}

export default function OrganizerProfilPage({ organizer }: { organizer: Organizer }) {
    const router = useRouter()
    const queryClient = useQueryClient()
    const hydrated = useAuthHydrated()
    const { user, isAuthenticated } = useAuthUser()

    const [statusFilter, setStatusFilter] = useState<OrganizerTimelineStatus>("UPCOMING")
    const [selectedEvent, setSelectedEvent] = useState<OrganizerTimelineEvent | null>(null)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [coverOverride, setCoverOverride] = useState<string | null>(null)
    const coverInputRef = useRef<HTMLInputElement | null>(null)

    const events = useMemo(() => {
        const filtered = organizer.events.filter((event) => event.status === statusFilter)

        return filtered.slice().sort((a, b) => {
            const at = new Date(a.startAt).getTime()
            const bt = new Date(b.startAt).getTime()

            const aTime = Number.isNaN(at) ? Number.POSITIVE_INFINITY : at
            const bTime = Number.isNaN(bt) ? Number.POSITIVE_INFINITY : bt

            return statusFilter === "UPCOMING" ? aTime - bTime : bTime - aTime
        })
    }, [organizer.events, statusFilter])

    const isOwner =
        hydrated &&
        isAuthenticated &&
        Boolean(user?.username) &&
        user!.username.trim().toLowerCase() === organizer.username.trim().toLowerCase()

    const meQuery = useQuery({
        queryKey: ["auth", "me"],
        queryFn: authApi.me,
        enabled: isOwner,
        retry: false,
    })

    const uploadCoverMutation = useMutation({
        mutationFn: (file: File) => profileApi.uploadCover(file),
        onSuccess: (profile) => {
            const url = profile.coverImage?.trim() || null
            if (url) setCoverOverride(url)

            queryClient.setQueryData<AuthUser>(["auth", "me"], (previous) => {
                if (!previous) return previous

                return {
                    ...previous,
                    organizerProfile: previous.organizerProfile
                        ? { ...previous.organizerProfile, ...profile }
                        : profile,
                }
            })

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

    const coverSrc =
        (isOwner
            ? (coverOverride?.trim() || meQuery.data?.organizerProfile?.coverImage?.trim())
            : organizer.coverImage?.trim()) || DEFAULT_ORGANIZER_COVER_IMAGE
    const organizerBio =
        (isOwner ? meQuery.data?.organizerProfile?.bio : organizer.bio) ?? organizer.bio ?? null

    const handlePickCover = () => coverInputRef.current?.click()

    const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        e.target.value = ""
        if (!file) return
        uploadCoverMutation.mutate(file)
    }

    const handleSelectEvent = (event: OrganizerTimelineEvent) => {
        setSelectedEvent(event)
        setDrawerOpen(true)
    }

    return (
        <Box maxW="1100px" mx="auto" px={{ base: 4, md: 6 }} py={{ base: 6, md: 8 }}>
            <Stack gap={6}>
                <Box position="relative">
                    <Box
                        {...panelStyles}
                        h={{ base: "200px", md: "260px" }}
                        overflow="hidden"
                        borderRadius="2xl"
                        position="relative"
                    >
                        <Image
                            src={coverSrc}
                            alt={`Couverture de ${organizer.name}`}
                            w="full"
                            h="full"
                            objectFit="cover"
                            objectPosition={"top"}
                        />
                        <Box
                            position="absolute"
                            inset={0}
                            bgGradient="linear(to-b, blackAlpha.200, blackAlpha.700)"
                        />

                        {isOwner ? (
                            <>
                                <input
                                    ref={coverInputRef}
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={handleCoverChange}
                                />
                                <IconButton
                                    aria-label="Changer la couverture"
                                    position="absolute"
                                    top={3}
                                    right={3}
                                    borderRadius="full"
                                    bg="blackAlpha.600"
                                    color="whiteAlpha.900"
                                    border="1px solid"
                                    borderColor="whiteAlpha.200"
                                    _hover={{ bg: "blackAlpha.700" }}
                                    onClick={handlePickCover}
                                    loading={uploadCoverMutation.isPending}
                                >
                                    <MdAddAPhoto />
                                </IconButton>
                            </>
                        ) : null}
                    </Box>

                    <Box
                        position="absolute"
                        left={{ base: 4, md: 6 }}
                        bottom={{ base: "-24px", md: "-28px" }}
                        boxSize={{ base: "56px", md: "64px" }}
                        borderRadius="xl"
                        overflow="hidden"
                        border="2px solid"
                        borderColor="gray.800"
                        bg="whiteAlpha.200"
                    >
                        <Image src={organizer.avatarUrl} alt={organizer.name} w="full" h="full" />
                    </Box>
                </Box>

                <Flex
                    align={{ base: "start", md: "center" }}
                    justify="space-between"
                    gap={4}
                    flexDirection={{ base: "column", md: "row" }}
                    pt={{ base: 4, md: 2 }}
                >
                    <Stack gap={1}>
                        <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="semibold">
                            {organizer.name}
                        </Text>
                        <Text color="gray.400" fontSize="sm">
                            {organizer.role}
                        </Text>
                        <Text maxW={"400px"} color={organizerBio?.trim() ? "gray.300" : "gray.500"} fontSize="sm">
                            {organizerBio?.trim() + "Ajoutez une bio dans vos parametres pour presenter votre profil." ||
                                (isOwner
                                    ? "Ajoutez une bio dans vos parametres pour presenter votre profil."
                                    : "Cet organisateur n'a pas encore ajoute de bio.")}
                        </Text>
                    </Stack>

                    <Button
                        size="sm"
                        bg="whiteAlpha.100"
                        color="gray.100"
                        borderRadius="xl"
                        hidden={!isOwner}
                        _hover={{ bg: "whiteAlpha.200" }}
                        onClick={() => router.push("/events")}
                    >
                        <MdArrowOutward />
                        Gerer mes événements
                    </Button>
                </Flex>
            </Stack>

            <Box mt={4} borderTop="1px solid" borderColor="whiteAlpha.200" pt={6}>
                <Grid templateColumns={{ base: "1fr", lg: "1.7fr 1fr" }} gap={6}>
                    <Stack gap={4}>
                        <Flex align="center" justify="space-between" gap={4} flexWrap="wrap">
                            <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="semibold">
                                Evenements
                            </Text>
                            <HStack gap={2} flexWrap="wrap">
                                <IconButton aria-label="Rechercher" {...iconButtonStyles} >
                                    <MdSearch />
                                </IconButton>
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

                            {events.length === 0 ? (
                                <Box
                                    bg="whiteAlpha.50"
                                    border="1px solid"
                                    borderColor="whiteAlpha.200"
                                    borderRadius="2xl"
                                    p={6}
                                >
                                    <Text color="gray.300">Aucun evenement public pour le moment.</Text>
                                </Box>
                            ) : null}
                        </Stack>
                    </Stack>

                    <Stack gap={4}>
                        <HStack justify="flex-end" gap={2} flexWrap="wrap">
                            <Button
                                size="sm"
                                bg="whiteAlpha.100"
                                color="gray.200"
                                borderRadius="lg"
                                hidden={!isOwner}
                                _hover={{ bg: "whiteAlpha.200" }}
                                onClick={() => router.push("/events/create")}
                            >
                                <MdAdd />
                                Ajouter un evenement
                            </Button>
                        </HStack>

                        <Box {...panelStyles} p={4}>
                            <Flex align="center" justify="space-between" mb={3}>
                                <Text fontWeight="semibold">fevrier</Text>
                                <HStack color="gray.400" gap={1}>
                                    <Icon as={MdChevronLeft} />
                                    <Icon as={MdChevronRight} />
                                </HStack>
                            </Flex>

                            <Grid templateColumns="repeat(7, 1fr)" gap={2} fontSize="xs">
                                {weekDays.map((day, index) => (
                                    <Text key={`${day}-${index}`} color="gray.500" textAlign="center">
                                        {day}
                                    </Text>
                                ))}
                                {calendarDays.map((day, index) => (
                                    <Text
                                        key={`${day}-${index}`}
                                        textAlign="center"
                                        color={day === "10" ? "gray.100" : "gray.500"}
                                        fontWeight={day === "10" ? "semibold" : "normal"}
                                    >
                                        {day}
                                    </Text>
                                ))}
                            </Grid>
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
                        </Box>
                        <LocationMap address="Dakar" />
                    </Stack>
                </Grid>
            </Box>
            <EventDrawer
                event={selectedEvent}
                organizer={organizer}
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
            />
        </Box>
    )
}

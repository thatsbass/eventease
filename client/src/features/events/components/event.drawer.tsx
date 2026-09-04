"use client"

import NextLink from "next/link"
import {
    Box,
    Button,
    CloseButton,
    Drawer,
    Flex,
    HStack,
    Icon,
    Image,
    Link,
    Portal,
    Stack,
    Text,
} from "@chakra-ui/react"
import { MdArrowOutward, MdLocationOn, MdOutlineGroups } from "react-icons/md"
import type { OrganizerTimelineEvent as Event, Organizer } from "@/features/events/types/events.types"
import UserAvatar from "@/components/shared/avatar"
import { LocationMap } from "./public/public.location-map"
import { getDateLabelParts } from "@/features/events/utils/date-label"
import { getInvitedLabel } from "@/features/events/utils/invited-label"
import config from "@/config/environment"
import { EventUrlClipboard } from "./event.clipboard"
import { useAuthUser } from "@/features/auth/hooks/use-auth-user"

type Props = {
    event?: Event | null
    organizer: Organizer
    open: boolean
    onOpenChange: (open: boolean) => void
}

export const EventDrawer = ({ event, organizer, open, onOpenChange }: Props) => {
    const { user, isAuthenticated } = useAuthUser();


    const isOwner = Boolean(
        isAuthenticated && user?.id && user.id === organizer.id
    );

    const { dateDay, dateMonth } = getDateLabelParts(event?.dateLabel)
    const invitedLabel = getInvitedLabel(event?.invitedCount)
    const { NEXT_PUBLIC_FRONT_URL: FRONT_URL } = config;

    return (
        <Drawer.Root
            open={open}
            placement="end"
            size={{ base: "full", md: "md" }}
            onOpenChange={(details) => onOpenChange(details.open)}
        >
            <Portal>
                <Drawer.Backdrop />
                <Drawer.Positioner>
                    <Drawer.Content
                        bg="rgba(18, 18, 20, 0.78)"
                        backdropFilter="blur(18px)"
                        boxShadow="0 30px 80px rgba(0, 0, 0, 0.45)"
                        borderLeft="1px solid"
                        borderColor="whiteAlpha.200"
                        overflow="hidden"

                    >
                        <Drawer.CloseTrigger asChild>
                            <CloseButton color={"whiteAlpha.500"} _hover={{ bg: "transparent", color: "whiteAlpha.700" }} size="sm" position="absolute" top="4" right="4" zIndex={2} />
                        </Drawer.CloseTrigger>

                        <Drawer.Header px={6} pt={6} pb={3}>
                            <HStack justify="space-between" gap={3} flexWrap="wrap">
                                <EventUrlClipboard value={`${FRONT_URL}/events/${event?.publicId}`} />
                                {event?.publicStatus === "PUBLISHED" ? (
                                    <Link href={`/events/${event.publicId}`} target="_blank">
                                        <Button
                                            size="xs"
                                            bg="whiteAlpha.200"
                                            color="gray.100"
                                            _hover={{ bg: "whiteAlpha.300" }}
                                        >
                                            Page d'evenement
                                            <MdArrowOutward />
                                        </Button>
                                    </Link>

                                ) : (
                                    <Button size="xs" bg="whiteAlpha.100" color="gray.500" disabled>
                                        Page d'evenement
                                    </Button>
                                )}
                            </HStack>
                        </Drawer.Header>

                        <Drawer.Body px={4} pb={6} className="hidden-scroll" >
                            {!event ? (
                                <Text color="gray.500">Selectionnez un evenement pour voir les details.</Text>
                            ) : (

                                <Stack gap={5}>
                                    {
                                        isOwner && (
                                            <Box
                                                bgGradient="to-r"
                                                gradientFrom={"rgba(126, 255, 66, 0.3)"}
                                                gradientTo={"rgba(16, 46, 2, 0.24)"}
                                                borderRadius="xl"
                                                px={4}
                                                py={3}
                                            >
                                                <Flex justify="space-between" align={{ base: "start", sm: "center" }} gap={3} flexWrap="wrap">
                                                    <Text color="gray.100" fontWeight="medium">
                                                        Vous avez les droits de gestion pour cet evenement.
                                                    </Text>
                                                    <Link as={NextLink} href={`/events/backstage/${event.id}`} _hover={{ textDecoration: "none" }}>
                                                        <Button
                                                            size="sm"
                                                            bg="green.500"
                                                            color="white"
                                                            borderRadius="full"
                                                            _hover={{ bg: "green.400" }}
                                                        >
                                                            Gerer
                                                        </Button>
                                                    </Link>

                                                </Flex>
                                            </Box>
                                        )
                                    }


                                    <Box
                                        borderRadius="2xl"
                                        borderColor="whiteAlpha.200"
                                        p={5}
                                    >
                                        <Stack gap={4}>
                                            <Box
                                                bg="transparent"
                                                borderRadius="2xl"
                                                p={2}
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="center"

                                            >
                                                <Image
                                                    src={event.coverImage}
                                                    alt={event.title}
                                                    w="250px"
                                                    h="250px"
                                                    objectFit="cover"
                                                    borderRadius="xl"
                                                    boxShadow="0 18px 40px rgba(84, 82, 82, 0.21)"
                                                />
                                            </Box>

                                            <Stack gap={2}>
                                                <Drawer.Title color={"white"} fontSize={{ base: "xl", md: "xl" }} fontWeight="semibold" >
                                                    {event.title}
                                                </Drawer.Title>
                                                <HStack gap={2} color="gray.300" fontSize="sm">
                                                    <UserAvatar
                                                        url={organizer.avatarUrl}
                                                        name={organizer.name}
                                                        isCertified={organizer.isCertified}
                                                    />
                                                    <Link _hover={{ textDecoration: "none" }} outline={"none"} href={`${FRONT_URL}/${organizer.username}`}><Text _hover={{ color: "whiteAlpha.900" }} color={"whiteAlpha.700"}>{organizer.name}</Text></Link>
                                                </HStack>
                                            </Stack>


                                            <Flex gap={3} flexWrap="wrap" justifyContent={"space-between"}>
                                                <HStack
                                                    borderRadius="lg"
                                                    bg="whiteAlpha.100"
                                                    border="1px solid"
                                                    borderColor="whiteAlpha.200"
                                                    px={3}
                                                    py={2}
                                                    gap={3}
                                                >
                                                    <Box
                                                        minW="44px"
                                                        textAlign="center"
                                                        borderRadius="md"
                                                        bg="blackAlpha.300"
                                                        px={2}
                                                        py={1}
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
                                                            {event.time}
                                                        </Text>
                                                    </Stack>
                                                </HStack>

                                                <HStack
                                                    borderRadius="lg"
                                                    bg="whiteAlpha.100"
                                                    border="1px solid"
                                                    borderColor="whiteAlpha.200"
                                                    px={3}
                                                    py={2}
                                                    gap={2}
                                                >
                                                    <Icon as={MdLocationOn} color="gray.300" />
                                                    <Stack gap={0}>
                                                        <Text fontSize="sm" color="gray.100">
                                                            {event.location}
                                                        </Text>
                                                        <Text fontSize="xs" color="gray.400">
                                                            Dakar, Region de Dakar
                                                        </Text>
                                                    </Stack>
                                                </HStack>
                                            </Flex>

                                            <HStack color="gray.400" fontSize="sm">
                                                <Icon as={MdOutlineGroups} />
                                                <Text>{invitedLabel}</Text>
                                            </HStack>
                                        </Stack>
                                    </Box>

                                    <Box
                                        borderRadius="xl"
                                        border="1px solid"
                                        borderColor="whiteAlpha.200"
                                        bg="rgba(255, 255, 255, 0.04)"
                                        backdropFilter="blur(14px)"
                                        p={4}
                                    >
                                        <Stack gap={2}>
                                            <Text fontWeight="semibold" color="gray.200">
                                                Inscription
                                            </Text>
                                            <Text fontSize="sm" color="gray.400">
                                                Bienvenue ! Veuillez choisir votre type de billet.
                                            </Text>
                                            <Button bg="white" color="gray.900" borderRadius="full" h="42px">
                                                S'inscrire
                                            </Button>
                                        </Stack>
                                    </Box>


                                    <Box
                                        borderRadius="xl"
                                        border="1px solid"
                                        borderColor="whiteAlpha.200"
                                        bg="rgba(255, 255, 255, 0.04)"
                                        backdropFilter="blur(14px)"
                                        p={4}
                                    >
                                        <Stack gap={3}>
                                            <Text fontWeight="semibold" color="gray.200">
                                                Lieu
                                            </Text>
                                            <Stack gap={1}>
                                                <Text color="gray.100">{event.location}</Text>
                                            </Stack>
                                            <LocationMap address={event.location} />
                                        </Stack>
                                    </Box>
                                </Stack>

                            )}
                        </Drawer.Body>
                    </Drawer.Content>
                </Drawer.Positioner>
            </Portal>
        </Drawer.Root>
    )
}

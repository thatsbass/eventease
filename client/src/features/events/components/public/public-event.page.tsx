"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  Float,
  Grid,
  HStack,
  Icon,
  IconButton,
  Image,
  Link,
  Separator,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  MdAccessTime,
  MdAdd,
  MdConfirmationNumber,
  MdLink,
  MdLocationOn,
  MdLock,
  MdRemove,
  MdShare,
} from "react-icons/md";
import { PiSealCheckFill } from "react-icons/pi";
import { toaster } from "@/components/ui/toaster";
import { useAuthUser } from "@/features/auth/hooks/use-auth-user";
import type {
  PublicEvent,
  PublicTicketType,
} from "@/features/events/types/events.types";
import { LocationMap } from "./public.location-map";

type PublicEventPageProps = {
  event: PublicEvent;
};

const DICEBEAR_BASE_URL = "https://api.dicebear.com/9.x/glass/svg?seed=";

const makeDicebearUrl = (seed: string) => {
  const safeSeed = encodeURIComponent(seed || "User");
  return `${DICEBEAR_BASE_URL}${safeSeed}`;
};

const normalizeSpaces = (value: string) => value.replace(/\s/g, " ");

const formatCurrency = (amount: number, currency: string) => {
  try {
    const formatted = new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);

    return normalizeSpaces(formatted);
  } catch {
    return normalizeSpaces(`${amount.toLocaleString("fr-FR")} ${currency}`);
  }
};

export const PublicEventPage = ({ event }: PublicEventPageProps) => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthUser();
  console.log("USER", event)
  const dateTokens = event.date
    .replaceAll(",", " ")
    .split(" ")
    .map((token) => token.trim())
    .filter(Boolean);
  let dayToken = "";
  let monthToken = "";

  for (let idx = dateTokens.length - 1; idx >= 0; idx -= 1) {
    if (/^\d{1,2}$/.test(dateTokens[idx])) {
      dayToken = dateTokens[idx];
      monthToken = dateTokens[idx + 1] ?? "";
      break;
    }
  }

  const monthShort = (monthToken || dateTokens[dateTokens.length - 1] || "")
    .replace(".", "")
    .slice(0, 3)
    .toUpperCase();
  const dayShort = dayToken || "--";

  const organizerName =
    event.organizer.name?.trim() || event.organizer.username;
  const organizerAvatarSrc =
    event.organizer.avatarUrl?.trim() || makeDicebearUrl(organizerName);

  const isOwner = Boolean(
    isAuthenticated && user?.id && user.id === event.organizer.id,
  );

  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    Object.fromEntries(event.ticketTypes.map((ticket) => [ticket.id, 0])),
  );

  const selections = useMemo(() => {
    return event.ticketTypes
      .map((ticket) => ({
        ticket,
        quantity: quantities[ticket.id] ?? 0,
      }))
      .filter((item) => item.quantity > 0);
  }, [event.ticketTypes, quantities]);

  const totalQuantity = selections.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const totalPrice = selections.reduce(
    (sum, item) => sum + item.ticket.price * item.quantity,
    0,
  );

  const adjustQuantity = (ticket: PublicTicketType, delta: number) => {
    setQuantities((current) => {
      const remaining = ticket.quantity - ticket.sold;
      const next = Math.min(
        remaining,
        Math.max(0, (current[ticket.id] ?? 0) + delta),
      );
      return { ...current, [ticket.id]: next };
    });
  };

  const handleGoToCheckout = () => {
    if (selections.length === 0) {
      toaster.create({
        description: "Selectionnez au moins un billet.",
        type: "error",
      });
      return;
    }

    const items = selections.map((item) => ({
      ticketTypeId: item.ticket.id,
      quantity: item.quantity,
    }));

    const params = new URLSearchParams({ items: JSON.stringify(items) });
    router.push(`/events/${event.publicId}/checkout?${params.toString()}`);
  };

  const handleCopyLink = async () => {
    const url = window.location.href;

    try {
      await navigator.clipboard.writeText(url);
      toaster.create({ description: "Lien copie.", type: "success" });
    } catch {
      toaster.create({
        description: "Impossible de copier le lien.",
        type: "error",
      });
    }
  };

  const handleShare = async () => {
    const url = window.location.href;

    if (!navigator.share) {
      handleCopyLink();
      return;
    }

    try {
      await navigator.share({ title: event.title, url });
    } catch {
      // user cancelled
    }
  };

  return (
    <Box
      maxW="1200px"
      mx="auto"
      px={{ base: 4, md: 8 }}
      py={{ base: 8, md: 10 }}
    >
      <Grid
        templateColumns={{ base: "1fr", lg: "1.05fr 1.4fr" }}
        gap={10}
        alignItems="start"
      >
        <Stack gap={6}>
          <Box
            borderRadius="2xl"
            overflow="hidden"
            border="1px solid"
            borderColor="whiteAlpha.200"
            bg="whiteAlpha.50"
          >
            {event.coverImage ? (
              <Image
                src={event.coverImage}
                alt={event.title}
                w="full"
                h="320px"
                objectFit="cover"
                objectPosition="top"
              />
            ) : (
              <Box h="320px" bgGradient="linear(to-br, gray.700, gray.800)" />
            )}
          </Box>

          <Box
            bg="whiteAlpha.50"
            border="1px solid"
            borderColor="whiteAlpha.200"
            borderRadius="2xl"
            p={5}
          >
            <Stack gap={4}>
              <Text fontSize="sm" color="gray.400">
                Organise par
              </Text>
              <HStack
                justify="space-between"
                align="start"
                gap={4}
                flexWrap="wrap"
              >
                <HStack gap={3} align="center">
                  <Avatar.Root>
                    <Avatar.Fallback name={organizerName} />
                    <Avatar.Image
                      objectPosition="top"
                      src={organizerAvatarSrc}
                    />
                    <Float
                      hidden={!event.organizer.certified}
                      placement="top-end"
                      offsetX="1"
                      offsetY="1"
                    >
                      <PiSealCheckFill size="12px" color="white" />
                    </Float>
                  </Avatar.Root>

                  <Stack gap={0} lineHeight="1.1">
                    <Text fontWeight="semibold">{organizerName}</Text>
                    <Text fontSize="xs" color="gray.400">
                      @{event.organizer.username}
                    </Text>
                  </Stack>
                </HStack>

                <HStack gap={2} flexWrap="wrap">
                  {isOwner ? (
                    <Link
                      as={NextLink}
                      href={`/events/backstage/${event.id}`}
                      _hover={{ textDecoration: "none" }}
                    >
                      <Button
                        size="sm"
                        bg="white"
                        color="gray.900"
                        borderRadius="full"
                        _hover={{ bg: "gray.100" }}
                      >
                        Gerer
                      </Button>
                    </Link>
                  ) : null}
                </HStack>
              </HStack>
            </Stack>
          </Box>

          <Stack gap={3} color="gray.300">
            {event.description ? <Text>{event.description}</Text> : null}
          </Stack>

        </Stack>

        <Stack gap={6}>
          <Stack gap={3}>
            <Text
              fontSize={{ base: "2xl", md: "3xl" }}
              fontWeight="semibold"
              color="white"
            >
              {event.title}
            </Text>

            <Stack gap={3} pt={1}>
              <HStack align="stretch" gap={3}>
                <Box
                  w="54px"
                  h="54px"
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="whiteAlpha.200"
                  bg="whiteAlpha.100"
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  lineHeight="1"
                  flexShrink={0}
                >
                  <Text fontSize="2xs" color="gray.400" fontWeight="bold">
                    {monthShort || "DATE"}
                  </Text>
                  <Text fontSize="xl" fontWeight="bold">
                    {dayShort}
                  </Text>
                </Box>
                <Stack gap={0.5}>
                  <Text fontSize={{ base: "sm", md: "md" }} fontWeight="medium">
                    {event.date}
                  </Text>
                  <HStack gap={1.5} color={"whiteAlpha.600"}>
                    <Icon as={MdAccessTime} boxSize={4} />
                    <Text fontSize={"xs"} >{event.time}</Text>
                  </HStack>
                </Stack>
              </HStack>

              <HStack align="stretch" gap={3}>
                <Box
                  w="54px"
                  h="54px"
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="whiteAlpha.200"
                  bg="whiteAlpha.100"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexShrink={0}
                >
                  <Icon as={MdLocationOn} boxSize={5} color="gray.300" />
                </Box>
                <Stack gap={0.5}>
                  <Text fontSize={{ base: "sm", md: "md" }} fontWeight="medium">
                    Inscrivez-vous pour voir l'adresse
                  </Text>
                  <Text color={"whiteAlpha.600"} fontSize={"xs"}>{event.location}</Text>
                </Stack>
              </HStack>
            </Stack>
          </Stack>

          <Box
            bg="whiteAlpha.50"
            border="1px solid"
            borderColor="whiteAlpha.200"
            borderTopRadius="2xl"
            pb={5}

          >
            <Box
              bg="whiteAlpha.100"
              border="1px solid"
              borderColor="whiteAlpha.200"
              borderTopRadius="lg"
              px={3.5}
              py={2.5}
            >
              <Text fontWeight="semibold" fontSize="xl" lineHeight="1">
                Acheter des billets
              </Text>
            </Box>
            <Stack gap={5} m={5}>
              <Text color="gray.200" fontWeight="medium">
                Bienvenue ! Veuillez choisir le type de billet souhaité.
              </Text>

              <Stack gap={3}>
                {event.ticketTypes.map((ticket) => {
                  const quantity = quantities[ticket.id] ?? 0;
                  const remaining = ticket.quantity - ticket.sold;
                  const isSoldOut = remaining <= 0;
                  const isLowStock = !isSoldOut && remaining <= 5;

                  return (
                    <Box
                      key={ticket.id}
                      borderRadius="lg"
                      border="2px solid"
                      borderColor={
                        isSoldOut ? "whiteAlpha.100" : "whiteAlpha.500"
                      }
                      bg="rgba(255, 255, 255, 0.04)"
                      px={3}
                      py={3}
                    >
                      <Stack gap={2}>
                        <Flex
                          justify="space-between"
                          align="center"
                          gap={2}
                        >
                          <HStack flexWrap="wrap" gap={1.5}>
                            <Text fontWeight="semibold" fontSize="sm">
                              {ticket.name}
                            </Text>
                            <Badge
                              variant="subtle"
                              bg="#f39b5327"
                              borderRadius="full"
                              fontSize="xs"
                              px={1.5}
                              color="#ffac68"
                            >
                              Validation requise
                            </Badge>
                          </HStack>
                          <Text fontWeight="semibold" color="gray.100" fontSize="sm" flexShrink={0}>
                            {formatCurrency(ticket.price, ticket.currency)}
                          </Text>
                        </Flex>

                        {ticket.description ? (
                          <Text fontSize="xs" color="gray.400">
                            {ticket.description}
                          </Text>
                        ) : null}

                        <Flex justify="space-between" align="center" gap={2}>
                          <HStack>
                            <Box
                              w="7px"
                              h="7px"
                              bg={
                                isSoldOut
                                  ? "gray.400"
                                  : isLowStock
                                    ? "orange.500"
                                    : "green.500"
                              }
                              borderRadius="full"
                            />
                            <Text fontSize="xs">
                              {isSoldOut
                                ? "Complet"
                                : isLowStock
                                  ? "Plus que 5 places"
                                  : "Disponible"}
                            </Text>
                          </HStack>

                          <HStack justify="flex-end" gap={1.5}>
                            <IconButton
                              aria-label="Retirer"
                              size="xs"
                              variant="outline"
                              borderRadius="full"
                              color="gray.200"
                              borderColor="whiteAlpha.200"
                              _hover={{ bg: "whiteAlpha.200" }}
                              disabled={quantity <= 0}
                              onClick={() => adjustQuantity(ticket, -1)}
                            >
                              <MdRemove />
                            </IconButton>

                            <Box
                              w="28px"
                              h="28px"
                              borderRadius="md"
                              border="1px solid"
                              borderColor="whiteAlpha.200"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              fontWeight="semibold"
                              fontSize="sm"
                            >
                              {quantity}
                            </Box>

                            <IconButton
                              aria-label="Ajouter"
                              size="xs"
                              variant="outline"
                              borderRadius="full"
                              color="gray.200"
                              borderColor="whiteAlpha.200"
                              _hover={{ bg: "whiteAlpha.200" }}
                              disabled={isSoldOut || quantity >= remaining}
                              onClick={() => adjustQuantity(ticket, 1)}
                            >
                              <MdAdd />
                            </IconButton>
                          </HStack>
                        </Flex>
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>

              <Flex
                justify="space-between"
                align="center"
                fontWeight="semibold"
                color="gray.100"
              >
                <Text>Total ({totalQuantity})</Text>
                <Text>
                  {formatCurrency(
                    totalPrice,
                    event.ticketTypes[0]?.currency ?? "XOF",
                  )}
                </Text>
              </Flex>

              <Button
                bg="white"
                color="gray.900"
                borderRadius="full"
                h="46px"
                _hover={{ bg: "gray.100" }}
                disabled={totalQuantity === 0}
                onClick={handleGoToCheckout}
              >
                Valider l&apos;achat
              </Button>

              <HStack justify="space-between" color="gray.500" fontSize="xs">
                <HStack>
                  <Icon as={MdLock} />
                  <Text>Paiement securise</Text>
                </HStack>
                <HStack>
                  <Icon as={MdConfirmationNumber} />
                  <Text>Billet digital</Text>
                </HStack>
              </HStack>
            </Stack>
          </Box>

          <Box
          >
            <Stack gap={3}>
              <Text fontWeight="semibold">Lieu</Text>
              <Separator borderColor={"whiteAlpha.300"} />
              <Text fontSize="sm" color="gray.200">
                {event.location}
              </Text>
              <LocationMap address={event.location} />
            </Stack>
          </Box>

          <HStack justify="space-between" pt={2} color="gray.500">
            <HStack gap={3}>
              <IconButton
                aria-label="Partager"
                variant="ghost"
                borderRadius="full"
                color="gray.400"
                _hover={{ bg: "whiteAlpha.200" }}
                onClick={handleShare}
              >
                <MdShare />
              </IconButton>
              <IconButton
                aria-label="Copier le lien"
                variant="ghost"
                borderRadius="full"
                color="gray.400"
                _hover={{ bg: "whiteAlpha.200" }}
                onClick={handleCopyLink}
              >
                <MdLink />
              </IconButton>
            </HStack>
            <Text fontSize="xs">Partager l&apos;evenement</Text>
          </HStack>
        </Stack>
      </Grid>
    </Box>
  );
};

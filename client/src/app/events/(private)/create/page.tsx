"use client";

import {
  Box,
  Button,
  Flex,
  Grid,
  HStack,
  Icon,
  IconButton,
  Input,
  Portal,
  Select,
  Stack,
  Text,
  Textarea,
  createListCollection,
} from "@chakra-ui/react";
import type { ReactNode } from "react";
import { useState, type FormEvent } from "react";
import type { IconType } from "react-icons";
import {
  MdAddAPhoto,
  MdCalendarMonth,
  MdChevronRight,
  MdLocationOn,
  MdOutlineStyle,
  MdPublic,
  MdShuffle,
  MdSubject,
} from "react-icons/md";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { toaster } from "@/components/ui/toaster";
import { ApiError } from "@/lib/api/client";
import { eventsApi } from "@/features/events/api/events.api";
import { eventQueryKeys } from "@/features/events/hooks/events.hooks";
import type { CreateEventRequest } from "@/features/events/schemas/events.requests";
import { eventCategorySchema, type EventCategoryDto } from "@/features/events/schemas/events.schemas";
import { utcDateTimeLocalToIso } from "@/features/events/utils/datetime-local";
import { DatePickerField } from "@/components/shared/date-test";
import { TimePickerField } from "@/components/shared/time-picker-field";

const panelStyles = {
  bg: "whiteAlpha.100",
  border: "1px solid",
  borderColor: "whiteAlpha.200",
  borderRadius: "xl",
} as const;

const chipStyles = {
  bg: "whiteAlpha.100",
  border: "1px solid",
  borderColor: "whiteAlpha.200",
  borderRadius: "full",
  px: 3,
  py: 1,
} as const;

const DEFAULT_EVENT_COVER_IMAGE =
  "https://res.cloudinary.com/dv9az7nno/image/upload/v1770269612/default-cover_mksocd.avif";

const CATEGORY_LABELS: Record<EventCategoryDto, string> = {
  MUSIC: "Musique",
  TECH: "Tech",
  SPORTS: "Sports",
  BUSINESS: "Business",
  EDUCATION: "Education",
  ART: "Art",
  COMMUNITY: "Communautaire",
  OTHER: "Autre",
};

const EVENT_CATEGORY_COLLECTION = createListCollection({
  items: eventCategorySchema.options.map((value) => ({
    value,
    label: CATEGORY_LABELS[value],
  })),
});

const getErrorMessage = (err: unknown) => {
  if (err instanceof z.ZodError) {
    return err.issues[0]?.message ?? "Donnees invalides";
  }

  if (err instanceof ApiError) {
    return err.message || "Une erreur est survenue";
  }

  if (err instanceof Error) {
    return err.message || "Une erreur est survenue";
  }

  return "Une erreur est survenue";
};

const pad2 = (value: number) => String(value).padStart(2, "0");

const getDatePart = (value: string) => value.split("T")[0] ?? "";

const getTimePart = (value: string) => value.split("T")[1] ?? "";

const datePartToPickerDate = (datePart: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return undefined;
  return new Date(`${datePart}T12:00:00.000Z`);
};

const pickerDateToDatePart = (value: Date) => {
  const yyyy = value.getFullYear();
  const mm = pad2(value.getMonth() + 1);
  const dd = pad2(value.getDate());
  return `${yyyy}-${mm}-${dd}`;
};

export default function Page() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [startAtLocal, setStartAtLocal] = useState("");
  const [endAtLocal, setEndAtLocal] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState<EventCategoryDto>("OTHER");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (values: CreateEventRequest) => eventsApi.create(values),
  });

  const isSubmitting = createMutation.isPending;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      if (!startAtLocal.trim()) {
        throw new Error("Date de debut requise.");
      }

      const startAtIso = utcDateTimeLocalToIso(startAtLocal);
      const endAtIso = endAtLocal.trim()
        ? utcDateTimeLocalToIso(endAtLocal)
        : undefined;

      const startAt = new Date(startAtIso);
      const endAt = endAtIso ? new Date(endAtIso) : null;

      if (endAt && endAt.getTime() <= startAt.getTime()) {
        throw new Error("La date de fin doit etre apres la date de debut.");
      }

      const payload: CreateEventRequest = {
        title,
        category,
        description: description.trim() ? description : undefined,
        location,
        startAt: startAtIso,
        endAt: endAtIso,
      };

      const created = await createMutation.mutateAsync(payload);

      queryClient.setQueryData(eventQueryKeys.mineById(created.id), created);
      queryClient.setQueryData(eventQueryKeys.mineList(), (previous) => {
        const prev = Array.isArray(previous) ? previous : [];
        return [created, ...prev];
      });

      toaster.create({
        description: "Evenement cree.",
        type: "success",
      });

      router.push(`/events/backstage/${created.id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Box
      maxW="1100px"
      mx="auto"
      px={{ base: 4, md: 6 }}
      pb={{ base: 6, md: 8 }}
    >
      <Grid
        templateColumns={{ base: "1fr", lg: "340px minmax(0, 1fr)" }}
        gap={{ base: 5, lg: 6 }}
        alignItems="start"
      >
        <Stack gap={3}>
          <Box {...panelStyles} p={2}>
            <Box
              position="relative"
              borderRadius="xl"
              overflow="hidden"
              h={{ base: "260px", md: "320px" }}
              bg="blackAlpha.800"
            >
              <Box
                position="absolute"
                inset={0}
                bgImage={`url('${DEFAULT_EVENT_COVER_IMAGE}')`}
                bgSize="cover"
                bgPos="center"
                opacity={0.85}
              />
              <Box
                position="absolute"
                inset={0}
                bgGradient="linear(to-b, blackAlpha.300, blackAlpha.700)"
              />
              <Text
                position="absolute"
                left={5}
                right={5}
                top={6}
                color="white"
                fontSize={{ base: "2xl", md: "3xl" }}
                lineHeight="0.95"
                fontWeight="black"
                letterSpacing="widest"
              >
                {(title || "NOUVEL EVENEMENT").toUpperCase()}
              </Text>
              <Text
                position="absolute"
                left={5}
                right={5}
                bottom={6}
                color="whiteAlpha.900"
                fontSize="xs"
                letterSpacing="widest"
                textTransform="uppercase"
              >
                {location.trim() ? location : "Couverture par defaut"}
              </Text>
              <IconButton
                aria-label="Ajouter une image"
                position="absolute"
                bottom={3}
                right={3}
                borderRadius="full"
                bg="white"
                color="gray.900"
                _hover={{ bg: "gray.100" }}
                size="sm"
                disabled
                title="Vous pourrez changer la couverture apres la creation."
              >
                <MdAddAPhoto />
              </IconButton>
            </Box>
          </Box>

          <HStack gap={3}>
            <HStack {...panelStyles} flex="1" px={3} py={2}>
              <Box
                boxSize="32px"
                borderRadius="md"
                bg="whiteAlpha.300"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="gray.200"
              >
                <Icon as={MdOutlineStyle} />
              </Box>
              <Stack gap={0} lineHeight="1.1">
                <Text color="gray.400" fontSize="xs">
                  Theme
                </Text>
                <Text color="gray.100" fontWeight="semibold" fontSize="sm">
                  Minimal
                </Text>
              </Stack>
              <Box ml="auto" color="gray.500">
                <Icon as={MdChevronRight} />
              </Box>
            </HStack>
            <IconButton
              aria-label="Changer de theme"
              {...panelStyles}
              px={3}
              py={2}
              color="gray.300"
              _hover={{ bg: "whiteAlpha.200" }}
              size="sm"
            >
              <MdShuffle />
            </IconButton>
          </HStack>
        </Stack>

        <Stack as="form" gap={3} onSubmit={handleSubmit}>
          <Flex justify="space-between" align="center" gap={3} flexWrap="wrap">
            <HStack {...chipStyles}>
              <Icon as={MdCalendarMonth} color="gray.300" />
              <Text fontSize="sm" color="gray.100" fontWeight="medium">
                Calendrier personnel
              </Text>
              <Icon as={MdChevronRight} color="gray.500" />
            </HStack>

            <HStack {...chipStyles}>
              <Icon as={MdPublic} color="gray.300" />
              <Text color="gray.100" fontWeight="medium" fontSize="sm">
                Public
              </Text>
              <Icon as={MdChevronRight} color="gray.500" />
            </HStack>
          </Flex>

          <Input
            placeholder="Nom de l'evenement"
            border="none"
            px={0}
            h="auto"
            color="gray.100"
            fontSize={{ base: "2xl", md: "3xl" }}
            fontWeight="medium"
            lineHeight="1.05"
            _placeholder={{ color: "whiteAlpha.600" }}
            _focusVisible={{ outline: "none", boxShadow: "none" }}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />

          <Grid templateColumns={{ base: "1fr", xl: "1.5fr 0.8fr" }} gap={3}>
            <Box {...panelStyles} p={3}>
              <Stack gap={3}>
                <FormRow
                  icon={MdCalendarMonth}
                  title="Debut"
                  content={
                    <HStack align="stretch" gap={2}>
                      <Box flex="1">
                        <DatePickerField
                          label=""
                          placeholder="Choisir une date"
                          value={datePartToPickerDate(getDatePart(startAtLocal)) ?? null}
                          onChange={(date) => {
                            if (!date) {
                              setStartAtLocal("");
                              return;
                            }
                            const datePart = pickerDateToDatePart(date);
                            const timePart = getTimePart(startAtLocal) || "00:00";
                            setStartAtLocal(`${datePart}T${timePart}`);
                          }}
                          triggerProps={{
                            bg: "whiteAlpha.200",
                            border: "1px solid",
                            borderColor: "whiteAlpha.300",
                            borderRadius: "full",
                            px: 3,
                            h: "38px",
                            color: "whiteAlpha.900",
                            fontSize: "sm",
                            _hover: { bg: "whiteAlpha.300" },
                            _active: { bg: "whiteAlpha.300" },
                          }}
                          valueTextColor="whiteAlpha.900"
                          placeholderTextColor="whiteAlpha.900"
                          popoverContentProps={{
                            bg: "rgba(18, 18, 20, 0.58)",
                            backdropFilter: "blur(18px)",
                            boxShadow: "0 30px 80px rgba(0, 0, 0, 0.45)",
                            borderLeft: "1px solid",
                            borderColor: "whiteAlpha.200",
                            color: "whiteAlpha.300",
                          }}
                          calendarWrapperProps={{
                            color: "gray.400",
                            css: {
                              "& .rdp-chevron": { fill: "white" },
                              "& .rdp-day_button": {
                                color: "whiteAlpha.900",
                                borderRadius: "9999px",
                              },
                              "& .rdp-selected": {
                                background: "transparent !important",
                              },
                              "& .rdp-selected .rdp-day_button": {
                                borderColor: "whiteAlpha.600",
                                borderRadius: "9999px",
                                background: "rgba(255,255,255,0.18)",
                              },
                              "& .rdp-today .rdp-day_button": {
                                border: "1px solid rgba(255,255,255,0.6) !important",
                                borderRadius: "9999px !important",
                              },
                            },
                          }}
                          clearButtonProps={{
                            color: "whiteAlpha.800",
                            _hover: { bg: "whiteAlpha.200", color: "white" },
                          }}
                          closeButtonProps={{
                            color: "whiteAlpha.900",
                            borderColor: "whiteAlpha.500",
                            _hover: { bg: "whiteAlpha.200", borderColor: "whiteAlpha.700" },
                          }}
                          todayStyle={{ color: "white" }}
                          selectedStyle={{ color: "white", background: "rgba(255,255,255,0.18)" }}

                        />
                      </Box>
                      <Box maxW="130px" w="full">
                        <TimePickerField
                          label=""
                          placeholder="Heure"
                          value={getDatePart(startAtLocal) ? getTimePart(startAtLocal) || "00:00" : null}
                          onChange={(time) => {
                            const datePart = getDatePart(startAtLocal);
                            if (!datePart) return;
                            setStartAtLocal(`${datePart}T${time ?? "00:00"}`);
                          }}
                          disabled={!getDatePart(startAtLocal)}
                          stepMinutes={15}
                          triggerProps={{
                            bg: "whiteAlpha.200",
                            border: "1px solid",
                            borderColor: "whiteAlpha.300",
                            borderRadius: "full",
                            px: 3,
                            h: "38px",
                            color: "whiteAlpha.900",
                            fontSize: "sm",
                            _hover: { bg: "whiteAlpha.300" },
                            _active: { bg: "whiteAlpha.300" },
                          }}
                          valueTextColor="whiteAlpha.900"
                          placeholderTextColor="whiteAlpha.900"
                          popoverContentProps={{
                            bg: "rgba(18, 18, 20, 0.58)",
                            backdropFilter: "blur(18px)",
                            boxShadow: "0 30px 80px rgba(0, 0, 0, 0.45)",
                            borderLeft: "1px solid",
                            borderColor: "whiteAlpha.200",
                            color: "whiteAlpha.300",
                          }}
                          timeInputProps={{
                            bg: "whiteAlpha.200",
                            borderColor: "whiteAlpha.300",
                            color: "whiteAlpha.900",
                          }}
                          optionButtonProps={{
                            color: "whiteAlpha.800",
                            _hover: { bg: "whiteAlpha.200" },
                          }}
                          selectedOptionButtonProps={{
                            bg: "whiteAlpha.300",
                            color: "white",
                            _hover: { bg: "whiteAlpha.300" },
                          }}
                          clearButtonProps={{
                            color: "whiteAlpha.800",
                            _hover: { bg: "whiteAlpha.200", color: "white" },
                          }}
                          closeButtonProps={{
                            color: "whiteAlpha.900",
                            borderColor: "whiteAlpha.500",
                            _hover: { bg: "whiteAlpha.200", borderColor: "whiteAlpha.700" },
                          }}
                        />
                      </Box>
                    </HStack>
                  }
                />
                <FormRow
                  icon={MdCalendarMonth}
                  title="Fin (optionnel)"
                  content={
                    <HStack align="stretch" gap={2}>
                      <Box flex="1">
                        <DatePickerField
                          label=""
                          placeholder="Choisir une date"
                          value={datePartToPickerDate(getDatePart(endAtLocal)) ?? null}
                          onChange={(date) => {
                            if (!date) {
                              setEndAtLocal("");
                              return;
                            }
                            const datePart = pickerDateToDatePart(date);
                            const timePart = getTimePart(endAtLocal) || "00:00";
                            setEndAtLocal(`${datePart}T${timePart}`);
                          }}
                          triggerProps={{
                            bg: "whiteAlpha.200",
                            border: "1px solid",
                            borderColor: "whiteAlpha.300",
                            borderRadius: "full",
                            px: 3,
                            h: "38px",
                            color: "whiteAlpha.900",
                            fontSize: "sm",
                            _hover: { bg: "whiteAlpha.300" },
                            _active: { bg: "whiteAlpha.300" },
                          }}
                          valueTextColor="whiteAlpha.900"
                          placeholderTextColor="whiteAlpha.900"
                          popoverContentProps={{
                            bg: "rgba(18, 18, 20, 0.58)",
                            backdropFilter: "blur(18px)",
                            boxShadow: "0 30px 80px rgba(0, 0, 0, 0.45)",
                            borderLeft: "1px solid",
                            borderColor: "whiteAlpha.200",
                            color: "whiteAlpha.300",
                          }}


                          calendarWrapperProps={{
                            color: "gray.300",
                            css: {
                              "& .rdp-chevron": { fill: "white" },
                              "& .rdp-day_button": {
                                color: "whiteAlpha.700",
                                borderRadius: "9999px",
                              },
                              "& .rdp-selected": {
                                background: "transparent !important",
                              },
                              "& .rdp-selected .rdp-day_button": {
                                borderColor: "whiteAlpha.600",
                                borderRadius: "9999px",
                                background: "rgba(255,255,255,0.18)",
                              },
                              "& .rdp-today .rdp-day_button": {
                                border: "1px solid rgba(255,255,255,0.6) !important",
                                borderRadius: "9999px !important",
                              },
                            },
                          }}
                          clearButtonProps={{
                            color: "whiteAlpha.800",
                            _hover: { bg: "whiteAlpha.200", color: "white" },
                          }}
                          closeButtonProps={{
                            color: "whiteAlpha.900",
                            borderColor: "whiteAlpha.500",
                            _hover: { bg: "whiteAlpha.200", borderColor: "whiteAlpha.700" },
                          }}
                          todayStyle={{ color: "white" }}
                          selectedStyle={{ color: "white", background: "transparent" }}
                        />
                      </Box>
                      <Box maxW="130px" w="full">
                        <TimePickerField
                          label=""
                          placeholder="Heure"
                          value={getDatePart(endAtLocal) ? getTimePart(endAtLocal) || "00:00" : null}
                          onChange={(time) => {
                            const datePart = getDatePart(endAtLocal);
                            if (!datePart) return;
                            setEndAtLocal(`${datePart}T${time ?? "00:00"}`);
                          }}
                          disabled={!getDatePart(endAtLocal)}
                          stepMinutes={15}
                          triggerProps={{
                            bg: "whiteAlpha.200",
                            border: "1px solid",
                            borderColor: "whiteAlpha.300",
                            borderRadius: "full",
                            px: 3,
                            h: "38px",
                            color: "whiteAlpha.900",
                            fontSize: "sm",
                            _hover: { bg: "whiteAlpha.300" },
                            _active: { bg: "whiteAlpha.300" },
                          }}
                          valueTextColor="whiteAlpha.900"
                          placeholderTextColor="whiteAlpha.900"
                          popoverContentProps={{
                            bg: "rgba(18, 18, 20, 0.58)",
                            backdropFilter: "blur(18px)",
                            boxShadow: "0 30px 80px rgba(0, 0, 0, 0.45)",
                            borderLeft: "1px solid",
                            borderColor: "whiteAlpha.200",
                            color: "whiteAlpha.300",
                          }}
                          timeInputProps={{
                            bg: "whiteAlpha.200",
                            borderColor: "whiteAlpha.300",
                            color: "whiteAlpha.900",
                          }}
                          optionButtonProps={{
                            color: "whiteAlpha.800",
                            _hover: { bg: "whiteAlpha.200" },
                          }}
                          selectedOptionButtonProps={{
                            bg: "whiteAlpha.300",
                            color: "white",
                            _hover: { bg: "whiteAlpha.300" },
                          }}
                          clearButtonProps={{
                            color: "whiteAlpha.800",
                            _hover: { bg: "whiteAlpha.200", color: "white" },
                          }}
                          closeButtonProps={{
                            color: "whiteAlpha.900",
                            borderColor: "whiteAlpha.500",
                            _hover: { bg: "whiteAlpha.200", borderColor: "whiteAlpha.700" },
                          }}
                        />
                      </Box>
                    </HStack>
                  }
                />
              </Stack>
            </Box>

            <Box {...panelStyles} p={3}>
              <HStack color="gray.300" mb={2}>
                <Icon as={MdPublic} />
                <Text fontWeight="medium" fontSize="sm">
                  Fuseau horaire
                </Text>
              </HStack>
              <Text fontSize="md" fontWeight="semibold">
                UTC
              </Text>
              <Text color="gray.400" fontSize="sm">
                GMT+00:00
              </Text>
            </Box>
          </Grid>

          <FormRow
            icon={MdLocationOn}
            title="Ajouter le lieu de l'evenement"
            content={
              <Input
                placeholder="Lieu physique ou lien virtuel"
                border="none"
                px={0}
                color="gray.300"
                fontSize="sm"
                _placeholder={{ color: "gray.500" }}
                _focusVisible={{ outline: "none", boxShadow: "none" }}
                value={location}
                onChange={(event) => setLocation(event.target.value)}
              />
            }
          />

          <FormRow
            icon={MdOutlineStyle}
            title="Categorie"
            content={
              <Select.Root
                collection={EVENT_CATEGORY_COLLECTION}
                value={[category]}
                onValueChange={(details) => {
                  const next = details.value[0];
                  if (!next) return;
                  setCategory(next as EventCategoryDto);
                }}
              >
                <Select.HiddenSelect />
                <Select.Control>
                  <Select.Trigger
                    bg="transparent"
                    border="none"
                    px={0}
                    color="gray.300"
                    fontSize="sm"
                    _focusVisible={{ outline: "none", boxShadow: "none" }}
                  >
                    <Select.ValueText placeholder="Choisir une categorie" />
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Portal>
                  <Select.Positioner>
                    <Select.Content
                      bg="rgba(18, 18, 20, 0.58)"
                      backdropFilter="blur(18px)"
                      color={"whiteAlpha.700"}
                      borderColor="whiteAlpha.300">
                      {EVENT_CATEGORY_COLLECTION.items.map((item) => (
                        <Select.Item item={item} key={item.value}>
                          {item.label}
                          <Select.ItemIndicator />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>
            }
          />

          <FormRow
            icon={MdSubject}
            title="Ajouter une description"
            content={
              <Textarea
                placeholder="Parle un peu de ton evenement..."
                resize="vertical"
                minH="30px"
                border="none"
                p={0}
                color="gray.300"
                fontSize="sm"
                _placeholder={{ color: "gray.500" }}
                _focusVisible={{ outline: "none", boxShadow: "none" }}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            }
          />

          {error ? (
            <Text fontSize="xs" color="red.300">
              {error}
            </Text>
          ) : null}

          <Button
            type="submit"
            mt={10}
            h="42px"
            bg="white"
            color="gray.900"
            borderRadius="lg"
            fontSize="md"
            fontWeight="semibold"
            _hover={{ bg: "gray.100" }}
            loading={isSubmitting}
          >
            Creer un evenement
          </Button>
        </Stack>
      </Grid>
    </Box>
  );
}

type FormRowProps = {
  icon: IconType;
  title: string;
  content: ReactNode;
};

const FormRow = ({ icon, title, content }: FormRowProps) => {
  return (
    <Box {...panelStyles} px={3} py={2.5}>
      <HStack color="gray.200">
        <Icon as={icon} />
        <Text fontSize="xs" fontWeight="medium">
          {title}
        </Text>
      </HStack>
      <Box mt={1}>{content}</Box>
    </Box>
  );
};

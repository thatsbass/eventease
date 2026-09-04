"use client"

import { Box, Flex, HStack, Skeleton, Stack } from "@chakra-ui/react"

type Props = {
  rows?: number
}

const skeletonColors = {
  startColor: "whiteAlpha.100",
  endColor: "whiteAlpha.300",
} as const

export function EventsListSkeleton({ rows = 4 }: Props) {
  return (
    <Box maxW="1100px" mx="auto" px={{ base: 4, md: 6 }} py={{ base: 5, md: 6 }}>
      <Flex
        align={{ base: "start", md: "center" }}
        justify="space-between"
        gap={4}
        mb={6}
        flexDirection={{ base: "column", md: "row" }}
      >
        <Stack gap={2} w="full" maxW="320px">
          <Skeleton h="28px" w="160px" borderRadius="md" {...skeletonColors} />
          <Skeleton h="16px" w="240px" borderRadius="md" {...skeletonColors} />
        </Stack>

        <HStack
          bg="whiteAlpha.100"
          border="1px solid"
          borderColor="whiteAlpha.200"
          borderRadius="lg"
          p={1}
        >
          <Skeleton h="24px" w="72px" borderRadius="md" {...skeletonColors} />
          <Skeleton h="24px" w="72px" borderRadius="md" {...skeletonColors} />
        </HStack>
      </Flex>

      <Stack gap={6}>
        {Array.from({ length: rows }).map((_, index) => (
          <TimelineRowSkeleton key={index} isLast={index === rows - 1} />
        ))}
      </Stack>
    </Box>
  )
}

function TimelineRowSkeleton({ isLast }: { isLast: boolean }) {
  return (
    <Box
      display="grid"
      gridTemplateColumns={{ base: "1fr", md: "140px 28px 1fr" }}
      gap={{ base: 3, md: 3 }}
      alignItems="start"
    >
      <Stack gap={1} align={{ base: "start", md: "end" }} minW={{ md: "110px" }}>
        <Skeleton h="20px" w="72px" borderRadius="md" {...skeletonColors} />
        <Skeleton h="14px" w="56px" borderRadius="md" {...skeletonColors} />
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
        bg="whiteAlpha.50"
        border="1px solid"
        borderColor="whiteAlpha.200"
        borderRadius="xl"
        py={2}
        px={4}
        w="full"
        maxW={{ base: "full", md: "720px" }}
        justifySelf={{ base: "stretch", md: "start" }}
      >
        <Flex justify="space-between" gap={3} direction={{ base: "column", md: "row" }}>
          <Stack gap={2} flex="1">
            <Skeleton h="16px" w="56px" borderRadius="md" {...skeletonColors} />
            <Skeleton h="22px" w={{ base: "85%", md: "60%" }} borderRadius="md" {...skeletonColors} />
            <Skeleton h="14px" w={{ base: "90%", md: "70%" }} borderRadius="md" {...skeletonColors} />
            <Skeleton h="14px" w={{ base: "75%", md: "55%" }} borderRadius="md" {...skeletonColors} />
            <Skeleton h="28px" w="150px" borderRadius="md" {...skeletonColors} />
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
            <Skeleton h="100%" w="100%" {...skeletonColors} />
          </Box>
        </Flex>
      </Box>
    </Box>
  )
}

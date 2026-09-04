import type { ReactNode } from "react"
import { Box, Flex, Stack, Text } from "@chakra-ui/react"

const glassCardStyles = {
  bg: "rgba(18, 18, 18, 0.6)",
  border: "1px solid",
  borderColor: "whiteAlpha.200",
  borderRadius: "2xl",
  backdropFilter: "blur(18px)",
  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.35)",
  sx: { WebkitBackdropFilter: "blur(18px)" },
} as const

type Props = {
  title: string
  subtitle: string
  children: ReactNode
}

export const AuthShell = ({ title, subtitle, children }: Props) => {
  return (
    <Box
      minH="100vh"
      bg="radial-gradient(circle at top, rgba(64, 12, 0, 0.9), #0f0f10 55%)"
      color="gray.100"
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top="-120px"
        right="-100px"
        w="320px"
        h="320px"
        bg="rgba(255, 120, 80, 0.25)"
        filter="blur(80px)"
        borderRadius="full"
      />
      <Box
        position="absolute"
        bottom="-160px"
        left="-120px"
        w="360px"
        h="360px"
        bg="rgba(110, 150, 255, 0.18)"
        filter="blur(90px)"
        borderRadius="full"
      />

      <Flex px={{ base: 4, md: 8 }} py={{ base: 10, md: 16 }} justify="center">
        <Box {...glassCardStyles} p={{ base: 6, md: 8 }} maxW="460px" w="full">
          <Stack gap={6}>
            <Stack gap={2}>
              <Text fontSize="2xl" fontWeight="semibold">
                {title}
              </Text>
              <Text color="gray.400" fontSize="sm">
                {subtitle}
              </Text>
            </Stack>

            {children}
          </Stack>
        </Box>
      </Flex>
    </Box>
  )
}
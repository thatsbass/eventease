import type { ComponentProps, ElementType } from "react"
import { Box, Flex, Icon, Input, Text } from "@chakra-ui/react"

type Props = {
  label: string
  icon: ElementType
} & Omit<ComponentProps<typeof Input>, "size" | "variant">

export function AuthField({ label, icon, ...inputProps }: Props) {
  return (
    <Box>
      <Text fontSize="xs" color="gray.400" mb={2}>
        {label}
      </Text>
      <Flex
        align="center"
        gap={2}
        bg="blackAlpha.500"
        border="1px solid"
        borderColor="whiteAlpha.200"
        borderRadius="lg"
        px={3}
        py={1}
      >
        <Icon as={icon} color="gray.400" />
        <Input
          variant="subtle"
          size="sm"
          color="gray.100"
          _placeholder={{ color: "gray.500" }}
          bg="transparent"
          {...inputProps}
        />
      </Flex>
    </Box>
  )
}


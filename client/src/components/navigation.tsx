"use client"

import NextLink from "next/link"
import { HStack, Link, Text } from "@chakra-ui/react"

type Props = {
  isAuth: boolean
}

export default function Navigation({ isAuth }: Props) {
  return (
    <HStack justifyContent="center" gap={5} fontSize="sm">
      <Link
        as={NextLink}
        href="/events"
        hidden={!isAuth}
        color="gray.200"
        _hover={{ textDecoration: "none", color: "white" }}
        _focusVisible={{
          outline: "2px solid",
          outlineColor: "whiteAlpha.600",
          outlineOffset: "2px",
        }}
      >
        <Text>Evenements</Text>
      </Link>

      <Link
        as={NextLink}
        href="/discover"
        display={{ base: "none", md: "block" }}
        color="gray.400"
        _hover={{ textDecoration: "none", color: "white" }}
        _focusVisible={{
          outline: "2px solid",
          outlineColor: "whiteAlpha.600",
          outlineOffset: "2px",
        }}
      >
        <Text>Explorer</Text>
      </Link>
      <Text display={{ base: "none", md: "block" }} color="gray.400">
        Tarifs
      </Text>
    </HStack>
  )
}

"use client"

import NextLink from "next/link"
import { Link, Text } from "@chakra-ui/react"

export default function Logo() {
  return (
    <Link
      as={NextLink}
      href="/"
      fontSize="md"
      color="gray.200"
      fontWeight="semibold"
      _hover={{ textDecoration: "none", color: "white" }}
      _focusVisible={{
        outline: "2px solid",
        outlineColor: "whiteAlpha.600",
        outlineOffset: "2px",
      }}
    >
      <Text>EventEase</Text>
    </Link>
  )
}
"use client"

import NextLink from "next/link"
import { useRouter } from "next/navigation"
import { Button, Link, Text } from "@chakra-ui/react"

type Props = {
  isAuthenticated: boolean
}

export function FormHeader({ isAuthenticated }: Props) {
  const router = useRouter()

  if (isAuthenticated) {
    return (
      <Link
        as={NextLink}
        href="/events/create"
        _hover={{ color: "white", textDecoration: "none" }}
        color="gray.400"
        display={{ base: "none", md: "block" }}
        _focusVisible={{
          outline: "2px solid",
          outlineColor: "whiteAlpha.600",
          outlineOffset: "2px",
        }}
      >
        <Text>Creer un evenement</Text>
      </Link>
    )
  }

  return (
    <Button
      ml={{ base: "auto", lg: 0 }}
      bg="whiteAlpha.200"
      color="gray.100"
      borderRadius="full"
      h="30px"
      px={5}
      fontSize="xs"
      _hover={{ bg: "whiteAlpha.300" }}
      _focusVisible={{
        outline: "2px solid",
        outlineColor: "whiteAlpha.600",
        outlineOffset: "2px",
      }}
      onClick={() => router.push("/auth/login")}
    >
      Se connecter
    </Button>
  )
}
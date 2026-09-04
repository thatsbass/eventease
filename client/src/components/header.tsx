"use client"

import { Flex, HStack } from "@chakra-ui/react"
import { useAuthUser } from "@/features/auth/hooks/use-auth-user"
import Navigation from "./navigation"
import Logo from "./shared/logo"
import Profil from "./profil"
import { FormHeader } from "./form-header"
import Timer from "./timer"

export default function Header() {
  const { user, displayName, avatarSrc, isAuthenticated } = useAuthUser()

  return (
    <Flex
      as="header"
      w="full"
      px={{ base: 4, md: 12 }}
      py={4}
      align="center"
      justify="space-between"
      gap={4}
    >
      <Logo />
      <Navigation isAuth={isAuthenticated} />
      <HStack fontSize="sm" color="gray.400" gapX={5} justify="flex-end" flex="1">
        <Timer />
        <FormHeader isAuthenticated={isAuthenticated} />
        <Profil
          avatarSrc={avatarSrc}
          displayName={displayName}
          username={user?.username ?? null}
          isAuth={isAuthenticated}
        />
      </HStack>
    </Flex>
  )
}
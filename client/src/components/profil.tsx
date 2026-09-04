"use client"

import { Avatar, Button, Menu, Portal } from "@chakra-ui/react"
import { useRouter } from "next/navigation"
import { authApi } from "@/features/auth/api/auth.api"
import { useAuthStore } from "@/features/auth/store/auth.store"

type Props = {
  displayName: string
  avatarSrc: string
  username?: string | null
  isAuth: boolean
}

export default function Profil({ avatarSrc, displayName, username, isAuth }: Props) {
  const router = useRouter()
  const logoutLocal = useAuthStore((s) => s.logout)

  const handleAccount = () => {
    if (!username) return
    router.push(`/${username}`)
  }

  const handleSettings = () => {
    router.push("/settings")
  }

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch {
      // ignore
    } finally {
      logoutLocal()
      router.push("/auth/login")
    }
  }

  if (!isAuth) return null

  return (
    <Menu.Root positioning={{ placement: "bottom-start" }}>
      <Menu.Trigger asChild>
        <Button
          variant="plain"
          p={0}
          borderRadius="full"
          minW="unset"
          h="auto"
          _hover={{ bg: "whiteAlpha.100" }}
          _focusVisible={{
            outline: "2px solid",
            outlineColor: "whiteAlpha.600",
            outlineOffset: "2px",
          }}
          aria-label="Menu profil"
        >
          <Avatar.Root size="sm">
            <Avatar.Fallback name={displayName} />
            <Avatar.Image fetchPriority="auto" src={avatarSrc} />
          </Avatar.Root>
        </Button>
      </Menu.Trigger>

      <Portal>
        <Menu.Positioner>
          <Menu.Content
            bg="rgba(18, 18, 20, 0.42)"
            backdropFilter="blur(18px)"
            border="1px solid"
            borderColor="whiteAlpha.200"
            borderRadius="xl"
            boxShadow="0 20px 60px rgba(0, 0, 0, 0.35)"
            p={2}
            minW="200px"
           
          >
            <Menu.Item  color={"whiteAlpha.700"}  _highlighted={{ bg: "gray.800", color: "white" , borderRadius:"lg"}} value="account" onClick={handleAccount} disabled={!username}>
              <Menu.ItemText>Mon profil</Menu.ItemText>
            </Menu.Item>

            <Menu.Item color={"whiteAlpha.700"}   _highlighted={{ bg: "gray.800", color: "white" , borderRadius:"lg"}} value="settings" onClick={handleSettings}>
              <Menu.ItemText>Parametres</Menu.ItemText>
            </Menu.Item>

            <Menu.Separator my={1} opacity={0.1} />

            <Menu.Item value="logout" onClick={handleLogout} color={"whiteAlpha.700"}  _highlighted={{ bg: "gray.800", color: "white" , borderRadius:"lg"}}>
              <Menu.ItemText>Deconnecter</Menu.ItemText>
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
}

"use client"

import Link from "next/link"
import { useEffect, useRef, useState, type ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Avatar,
  Badge,
  Box,
  Button,
  Center,
  HStack,
  Input,
  Spinner,
  Stack,
  Textarea,
  Tabs,
  Text,
} from "@chakra-ui/react"
import { ApiError } from "@/lib/api/client"
import { toaster } from "@/components/ui/toaster"
import { authApi } from "@/features/auth/api/auth.api"
import { useAuthHydrated } from "@/features/auth/hooks/use-auth-hydrated"
import { useAuthUser } from "@/features/auth/hooks/use-auth-user"
import { toUserSnapshot, type AuthUser } from "@/features/auth/schemas/auth.schemas"
import { useAuthStore } from "@/features/auth/store/auth.store"
import { profileApi } from "@/features/profile/api/profile.api"
import { MdArrowOutward } from "react-icons/md"

const DICEBEAR_BASE_URL = "https://api.dicebear.com/9.x/glass/svg?seed="

const makeDicebearUrl = (seed: string) => {
  const safeSeed = encodeURIComponent(seed || "User")
  return `${DICEBEAR_BASE_URL}${safeSeed}`
}

export function SettingsRoute() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const hydrated = useAuthHydrated()
  const { isAuthenticated } = useAuthUser()
  const logoutLocal = useAuthStore((s) => s.logout)
  const setUser = useAuthStore((s) => s.setUser)
  const avatarInputRef = useRef<HTMLInputElement | null>(null)
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [bio, setBio] = useState("")
  const [timezone, setTimezone] = useState("UTC")

  useEffect(() => {
    if (!hydrated) return
    if (!isAuthenticated) router.replace("/auth/login")
  }, [hydrated, isAuthenticated, router])

  const meQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: authApi.me,
    enabled: hydrated && isAuthenticated,
    retry: false,
  })

  useEffect(() => {
    if (!meQuery.data) return
    setName(meQuery.data.name?.trim() || meQuery.data.username)
    setUsername(meQuery.data.username)
    setBio(meQuery.data.organizerProfile?.bio || "")
    setTimezone(meQuery.data.organizerProfile?.timezone || "UTC")
  }, [meQuery.data])

  const updateProfileMutation = useMutation({
    mutationFn: (values: { name: string; username: string; bio: string | null; timezone: string }) =>
      profileApi.updateProfile(values),
    onSuccess: (updated) => {
      queryClient.setQueryData<AuthUser>(["auth", "me"], updated)
      setUser(toUserSnapshot(updated))
      toaster.create({
        description: "Informations personnelles mises a jour.",
        type: "success",
      })
    },
    onError: (err) => {
      toaster.create({
        description: err instanceof ApiError ? err.message : "Mise a jour impossible.",
        type: "error",
      })
    },
  })

  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => profileApi.uploadAvatar(file),
    onSuccess: (updated) => {
      queryClient.setQueryData<AuthUser>(["auth", "me"], updated)
      setUser(toUserSnapshot(updated))
      toaster.create({
        description: "Avatar mis a jour.",
        type: "success",
      })
    },
    onError: (err) => {
      toaster.create({
        description: err instanceof ApiError ? err.message : "Upload avatar impossible.",
        type: "error",
      })
    },
  })

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

  const handlePickAvatar = () => avatarInputRef.current?.click()

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    uploadAvatarMutation.mutate(file)
  }

  const handleSaveProfile = () => {
    const payload = {
      name: name.trim(),
      username: username.trim(),
      bio: bio.trim() ? bio.trim() : null,
      timezone: timezone.trim() || "UTC",
    }

    if (!payload.name || !payload.username) {
      toaster.create({
        description: "Nom et username sont requis.",
        type: "error",
      })
      return
    }

    updateProfileMutation.mutate(payload)
  }

  if (!hydrated || !isAuthenticated) {
    return (
      <Center py={{ base: 10, md: 16 }}>
        <Spinner color="whiteAlpha.600" />
      </Center>
    )
  }

  if (meQuery.isLoading) {
    return (
      <Center py={{ base: 10, md: 16 }}>
        <Spinner color="whiteAlpha.600" />
      </Center>
    )
  }

  if (meQuery.isError || !meQuery.data) {
    const status = meQuery.error instanceof ApiError ? meQuery.error.status : null

    return (
      <Center py={{ base: 10, md: 16 }}>
        <Stack gap={1} textAlign="center">
          <Text fontWeight="semibold">
            {status === 401 ? "Session expiree" : "Impossible de charger vos parametres"}
          </Text>
          <Text color="gray.400" fontSize="sm">
            Reessayez dans quelques secondes.
          </Text>
        </Stack>
      </Center>
    )
  }

  const me = meQuery.data
  const displayName = me.name?.trim() || me.username
  const avatarSrc = me.avatarUrl?.trim() || makeDicebearUrl(displayName)

  return (
    <Box maxW="980px" mx="auto" px={{ base: 4, md: 6 }} py={{ base: 6, md: 8 }}>
      <Stack gap={5}>
        <Stack gap={1}>
          <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="black" letterSpacing="tight">
            Parametres
          </Text>
          <Text color="gray.400">
            Gerer votre profil, votre compte et vos actions sensibles.
          </Text>
        </Stack>

        <Tabs.Root defaultValue="profile" variant="line" colorPalette="green">
          <Tabs.List borderBottom="1px solid" borderColor="whiteAlpha.200" gap={5}>
            <Tabs.Trigger value="profile" color="gray.400" _selected={{ color: "white" }}>
              Profil
            </Tabs.Trigger>
            <Tabs.Trigger value="account" color="gray.400" _selected={{ color: "white" }}>
              Compte
            </Tabs.Trigger>
            <Tabs.Trigger value="danger" color="gray.400" _selected={{ color: "white" }}>
              Zone danger
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="profile" pt={4}>
            <Stack gap={4}>
              <Box
                bg="whiteAlpha.50"
                border="1px solid"
                borderColor="whiteAlpha.200"
                borderRadius="2xl"
                p={{ base: 4, md: 5 }}
              >
                <HStack justify="space-between" align="start" gap={4} flexWrap="wrap">
                  <HStack gap={3}>
                    <Avatar.Root size="lg">
                      <Avatar.Fallback name={displayName} />
                      <Avatar.Image src={avatarSrc} />
                    </Avatar.Root>
                    <Stack gap={0.5}>
                      <Text fontWeight="semibold">{displayName}</Text>
                      <Text color="gray.400" fontSize="xs">@{me.username}</Text>
                    </Stack>
                  </HStack>
                  <HStack gap={2} flexWrap="wrap">
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleAvatarChange}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      borderColor="whiteAlpha.300"
                      color="gray.100"
                      onClick={handlePickAvatar}
                      loading={uploadAvatarMutation.isPending}
                      _hover={{bg : "whiteAlpha.200"}}
                      borderRadius={"full"}
                    >
                      Changer avatar
                    </Button>
                    <Link href={`/${me.username}`}>
                      <Button size="sm" bg="transparent" color="whiteAlpha.500" _hover={{ color: "gray.100" }}>
                        Ouvrir mon profil
                        <MdArrowOutward />
                      </Button>
                    </Link>
                  </HStack>
                </HStack>
              </Box>

              <Box
                bg="whiteAlpha.50"
                border="1px solid"
                borderColor="whiteAlpha.200"
                borderRadius="2xl"
                p={{ base: 4, md: 5 }}
              >
                <Stack gap={3}>
                  <Text fontWeight="semibold">Informations du profil</Text>
                  <Stack gap={2}>
                    <Text fontSize="xs" color="gray.400">Nom complet</Text>
                    <Input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      bg="whiteAlpha.100"
                      borderColor="whiteAlpha.200"
                      borderRadius={"full"}
                    />
                  </Stack>
                  <Stack gap={2}>
                    <Text fontSize="xs" color="gray.400">Username</Text>
                    <Input
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      bg="whiteAlpha.100"
                      borderColor="whiteAlpha.200"
                      borderRadius={"full"}
                    />
                  </Stack>
                  <Stack gap={2}>
                    <Text fontSize="xs" color="gray.400">Timezone</Text>
                    <Input
                      value={timezone}
                      onChange={(event) => setTimezone(event.target.value)}
                      bg="whiteAlpha.100"
                      borderColor="whiteAlpha.200"
                      borderRadius={"full"}
                    />
                  </Stack>
                  <Stack gap={2}>
                    <Text fontSize="xs" color="gray.400">Bio</Text>
                    <Textarea
                      value={bio}
                      onChange={(event) => setBio(event.target.value)}
                      resize="vertical"
                      bg="whiteAlpha.100"
                      borderColor="whiteAlpha.200"
                      minH="88px"
                    />
                  </Stack>
                  <HStack justify="flex-end">
                    <Button
                      size="sm"
                      bg="white"
                      color="gray.900"
                      _hover={{ bg: "gray.100" }}
                      loading={updateProfileMutation.isPending}
                      onClick={handleSaveProfile}
                    >
                      Enregistrer les modifications
                    </Button>
                  </HStack>
                </Stack>
              </Box>
            </Stack>
          </Tabs.Content>

          <Tabs.Content value="account" pt={4}>
            <Stack gap={4}>
              <Box
                bg="whiteAlpha.50"
                border="1px solid"
                borderColor="whiteAlpha.200"
                borderRadius="2xl"
                p={{ base: 4, md: 5 }}
              >
                <Stack gap={3}>
                  <Text fontWeight="semibold">Compte</Text>
                  <Stack gap={2}>
                    <Text fontSize="xs" color="gray.400">Email</Text>
                    <Input value={me.email} readOnly bg="whiteAlpha.100" borderColor="whiteAlpha.200" borderRadius={"full"} />
                  </Stack>
                  <HStack gap={2} flexWrap="wrap">
                    <Badge bg={me.verified ? "green.500" : "orange.500"} color="white" borderRadius="full" px={2.5} py={1}>
                      {me.verified ? "Email verifie" : "Email non verifie"}
                    </Badge>
                    <Badge bg="whiteAlpha.200" color="gray.100" borderRadius="full" px={2.5} py={1}>
                      Role: {me.role}
                    </Badge>
                  </HStack>
                </Stack>
              </Box>

              <Box
                bg="whiteAlpha.50"
                border="1px solid"
                borderColor="whiteAlpha.200"
                borderRadius="2xl"
                p={{ base: 4, md: 5 }}
              >
                <Stack gap={3}>
                  <Text fontWeight="semibold">Securite</Text>
                  <Button
                    size="sm"
                    variant="outline"
                    borderColor="whiteAlpha.300"
                    color="gray.200"
                    justifyContent="start"
                    disabled
                  >
                    Changer le mot de passe (bientot)
                  </Button>
                  <Button
                    size="sm"
                    bg="white"
                    color="gray.900"
                    _hover={{ bg: "gray.100" }}
                    onClick={handleLogout}
                    alignSelf="start"
                  >
                    Se deconnecter
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </Tabs.Content>

          <Tabs.Content value="danger" pt={4}>
            <Box
              bg="rgba(120, 20, 20, 0.06)"
              border="1px solid"
              borderColor="red.300"
              borderRadius="2xl"
              p={{ base: 4, md: 5 }}
            >
              <Stack gap={3}>
                <Text fontWeight="semibold" color="red.300">
                  Zone danger
                </Text>
                <Text color="gray.200" fontSize="sm">
                  Les actions de cette section peuvent avoir un impact irreversible.
                </Text>
                <HStack gap={3} flexWrap="wrap">
                  <Button colorPalette="red" variant="solid" size="sm" onClick={handleLogout}>
                    Se deconnecter maintenant
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    borderColor="red.400"
                    color="red.200"
                    disabled
                  >
                    Supprimer le compte (bientot)
                  </Button>
                </HStack>
              </Stack>
            </Box>
          </Tabs.Content>
        </Tabs.Root>
      </Stack>
    </Box>
  )
}

import { useQuery } from "@tanstack/react-query"
import { useAuthUser } from "@/features/auth/hooks/use-auth-user"
import { eventsApi } from "../api/events.api"

export const eventQueryKeys = {
  all: ["events"] as const,

  public: () => [...eventQueryKeys.all, "public"] as const,
  publicList: () => [...eventQueryKeys.public(), "list"] as const,
  publicByPublicId: (publicId: string) => [...eventQueryKeys.public(), publicId] as const,

  mine: () => [...eventQueryKeys.all, "mine"] as const,
  mineList: () => [...eventQueryKeys.mine(), "list"] as const,
  mineById: (eventId: string) => [...eventQueryKeys.mine(), eventId] as const,
}

export const usePublicEvents = () => {
  return useQuery({
    queryKey: eventQueryKeys.publicList(),
    queryFn: () => eventsApi.listPublic(),
  })
}

export const usePublicEvent = (publicId: string) => {
  return useQuery({
    queryKey: eventQueryKeys.publicByPublicId(publicId),
    queryFn: () => eventsApi.getPublicByPublicId(publicId),
    enabled: Boolean(publicId),
  })
}

export const useMyEvents = () => {
  const { isAuthenticated } = useAuthUser()

  return useQuery({
    queryKey: eventQueryKeys.mineList(),
    queryFn: () => eventsApi.listMine(),
    enabled: isAuthenticated,
  })
}

export const useMyEvent = (eventId: string) => {
  const { isAuthenticated } = useAuthUser()

  return useQuery({
    queryKey: eventQueryKeys.mineById(eventId),
    queryFn: () => eventsApi.getMineById(eventId),
    enabled: isAuthenticated && Boolean(eventId),
  })
}

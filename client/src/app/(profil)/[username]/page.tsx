import { OrganizerProfileRoute } from "@/features/organizer/routes/organizer-profile.route"

type PageProps = {
  params: Promise<{username: string}>
}

export default async function Page({ params }: PageProps) {
  const { username } = await params
  return <OrganizerProfileRoute username={username} />
}

import { BackstageRoute } from "@/features/events/routes/backstage.route"

type PageProps = {
  params: Promise<{ eventId: string }>
}

export default async function Page({ params }: PageProps) {
  const { eventId } = await params

  return <BackstageRoute eventId={eventId} />
}

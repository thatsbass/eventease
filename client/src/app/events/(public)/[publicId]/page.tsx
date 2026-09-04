import { PublicEventRoute } from "@/features/events/routes/public-event.route"

type PageProps = {
  params: Promise<{ publicId: string }>
}

export default async function Page({ params }: PageProps) {
  const { publicId } = await params

  return <PublicEventRoute publicId={publicId} />
}

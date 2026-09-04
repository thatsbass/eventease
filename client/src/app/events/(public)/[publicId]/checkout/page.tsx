import { PublicCheckoutRoute } from "@/features/events/routes/public-checkout.route"

type CheckoutItem = {
  ticketTypeId: string
  quantity: number
}

type PageProps = {
  params: Promise<{ publicId: string }>
  searchParams: Promise<{ items?: string }>
}

const parseCheckoutItems = (value: string | undefined): CheckoutItem[] => {
  if (!value) {
    return []
  }

  try {
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
      .map((item) => {
        const ticketTypeId = typeof item?.ticketTypeId === "string" ? item.ticketTypeId : ""
        const quantity = Number(item?.quantity)
        if (!ticketTypeId || !Number.isFinite(quantity) || quantity <= 0) {
          return null
        }

        return {
          ticketTypeId,
          quantity: Math.floor(quantity),
        }
      })
      .filter((item): item is CheckoutItem => Boolean(item))
  } catch {
    return []
  }
}

export default async function Page({ params, searchParams }: PageProps) {
  const { publicId } = await params
  const { items } = await searchParams

  const initialItems = parseCheckoutItems(items)

  return <PublicCheckoutRoute publicId={publicId} initialItems={initialItems} />
}

import { CheckoutSuccessPage } from "@/features/checkout/checkout.page"

type PageProps = {
  searchParams: Promise<{ session_id?: string }>
}

export default async function Page({ searchParams }: PageProps) {
  const { session_id: sessionId } = await searchParams

  if (!sessionId) return null

  return (
    <CheckoutSuccessPage />
  )
}

import type { Metadata } from "next"
import { OrganizerLayout } from "@/components/layout"
import { META_DATA } from "@/constant"

export const metadata: Metadata = META_DATA;

export default function Layout({ children }: { children: React.ReactNode }) {
  return <OrganizerLayout>{children}</OrganizerLayout>
}

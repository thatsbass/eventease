import type { CSSProperties } from "react"
import { keyframes } from "@emotion/react"
import type { IconType } from "react-icons"
import {
  MdGroups,
  MdInsights,
  MdLock,
  MdNotificationsActive,
  MdRocketLaunch,
  MdSell,
} from "react-icons/md"

export type FeatureItem = {
  icon: IconType
  title: string
  description: string
}

export type StepItem = {
  step: string
  title: string
  description: string
}

export type PricingItem = {
  name: string
  price: string
  subtitle: string
  ctaLabel: string
  href: string
  highlighted?: boolean
  bullets: string[]
}

export const LANDING_VARS: CSSProperties = {
  "--landing-bg": "transparent",
  "--landing-text": "#f7f7f7",
  "--landing-muted": "rgba(255, 255, 255, 0.68)",
  "--landing-border": "rgba(255, 255, 255, 0.2)",
  "--landing-surface": "rgba(255, 255, 255, 0.05)",
  "--landing-surface-strong": "rgba(255, 255, 255, 0.1)",
  "--landing-accent": "#8ad5ff",
  "--landing-accent-soft": "rgba(138, 213, 255, 0.16)",
  "--landing-highlight": "#885df6",
} as CSSProperties

export const HERO_METRICS = [
  { value: "12k+", label: "evenements publies" },
  { value: "95%", label: "tickets envoyes en moins de 60 sec" },
  { value: "4.9/5", label: "satisfaction organisateurs" },
]

export const PREVIEW_EVENTS = [
  { name: "Afterwork Product", time: "18:00", tickets: "312 tickets" },
  { name: "Run Club Dakar", time: "06:30", tickets: "164 tickets" },
  { name: "Meetup Creators", time: "20:15", tickets: "87 tickets" },
]

export const FEATURE_ITEMS: FeatureItem[] = [
  { icon: MdSell, title: "Billetterie instantanee", description: "Creer, publier et vendre vos places en quelques minutes sans config complexe." },
  { icon: MdNotificationsActive, title: "Relances automatiques", description: "Activez rappels email et notifications pour reduire les no-show avant l'ouverture." },
  { icon: MdInsights, title: "Pilotage en temps reel", description: "Suivez ventes, scans et remplissage depuis un tableau de bord clair et actionnable." },
  { icon: MdGroups, title: "Experience invite premium", description: "Checkout fluide, billets digitaux et parcours mobile optimise pour vos participants." },
  { icon: MdLock, title: "Paiements securises", description: "Transactions protegees et emission automatique des billets apres paiement valide." },
  { icon: MdRocketLaunch, title: "Lancement rapide", description: "Passez de l'idee au lien public partageable en une seule session de travail." },
]

export const STEP_ITEMS: StepItem[] = [
  { step: "01", title: "Configurez l'evenement", description: "Nom, date, capacite et types de tickets. EventEase prepare la page publique automatiquement." },
  { step: "02", title: "Partagez et convertissez", description: "Diffusez votre lien, suivez les inscriptions et adaptez vos offres selon la traction." },
  { step: "03", title: "Scannez et analysez", description: "Le jour J, validez les billets puis consultez le recap ventes, attendance et revenus." },
]

export const PRICING_ITEMS: PricingItem[] = [
  { name: "Starter", price: "Gratuit", subtitle: "Parfait pour lancer vos premiers evenements", ctaLabel: "Commencer", href: "/auth/login", bullets: ["1 evenement actif", "Billetterie en ligne", "Check-in mobile", "Support standard"] },
  { name: "Scale", price: "Pro", subtitle: "Pour les equipes qui gerent plusieurs dates", ctaLabel: "Creer un evenement", href: "/events/create", highlighted: true, bullets: ["Evenements illimites", "Segmentation audience", "Exports et analytics avances", "Support prioritaire"] },
]

const riseIn = keyframes`
  from { opacity: 0; transform: translate3d(0, 26px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
`

export const floatCard = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`

export const pulseDot = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(15, 118, 110, 0.4); }
  100% { box-shadow: 0 0 0 10px rgba(15, 118, 110, 0); }
`

export const reveal = (delayMs: number) =>
  `${riseIn} 700ms cubic-bezier(0.22, 1, 0.36, 1) ${delayMs}ms both`

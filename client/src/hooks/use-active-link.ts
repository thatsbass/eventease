'use client'


import constants from '@/constant'
import { usePathname } from 'next/navigation';

type UseActiveLinkOptions = {
  navLinks?: { label: string; href: string }[]
  subRoutes?: { pattern: RegExp; label: string; parentHref: string }[]
}


export function useActiveLink(options: UseActiveLinkOptions = {}) {
  const { NAV_LINKS, SUB_ROUTES } = constants
  const navLinks = options.navLinks ?? NAV_LINKS
  const subRoutes = options.subRoutes ?? SUB_ROUTES
  const pathname = usePathname()

  const normalize = (path: string) =>
  path !== '/' ? path.replace(/\/+$/, '') : '/'

  const current = normalize(pathname)

  const isActive = (href: string) =>
    current === href || current.startsWith(`${href}/`)

  const parentNav = navLinks.find((item) => isActive(item.href))

  const subRoute = subRoutes.find((r) => r.pattern.test(current))

  return {
    isActive,
    parentLabel: parentNav?.label ?? '',
    parentHref: parentNav?.href ?? '',
    currentLabel: subRoute?.label ?? parentNav?.label ?? '',
  }
}

'use client'

import { ConvexProvider, ConvexReactClient } from 'convex/react'
import type { ReactNode } from 'react'

const convexUrl =
  process.env.NEXT_PUBLIC_CONVEX_URL?.trim() ||
  'https://artwise-convex-not-configured.invalid'

const convex = new ConvexReactClient(convexUrl)

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>
}

export function isConvexConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_CONVEX_URL?.trim())
}

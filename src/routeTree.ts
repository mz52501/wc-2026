import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import { RootLayout } from '@/components/RootLayout'
import { MatchesPage } from '@/pages/MatchesPage'
import { StandingsPage } from '@/pages/StandingsPage'
import { MyDuelsPage } from '@/pages/MyDuelsPage'
import { BonusPage } from '@/pages/BonusPage'
import { RulesPage } from '@/pages/RulesPage'
import { ResetPasswordPage } from '@/pages/ResetPasswordPage'

const rootRoute = createRootRoute({ component: RootLayout })

const matchesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: MatchesPage,
})

const standingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/standings',
  component: StandingsPage,
})

const myDuelsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-duels',
  component: MyDuelsPage,
})

const bonusRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/bonus',
  component: BonusPage,
})

const rulesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/rules',
  component: RulesPage,
})

const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reset-password',
  component: ResetPasswordPage,
})

export const routeTree = rootRoute.addChildren([
  matchesRoute,
  standingsRoute,
  myDuelsRoute,
  bonusRoute,
  rulesRoute,
  resetPasswordRoute,
])

export type Router = ReturnType<typeof createRouter<typeof routeTree>>

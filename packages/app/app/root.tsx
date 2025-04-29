import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  type LoaderFunctionArgs,
} from 'react-router'

import type { Route } from './+types/root'
import './app.css'
import { Header } from './nav/header'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createContext, useContext, useState } from 'react'
import { hc } from 'hono/client'
import type { AppType } from '@reverse-djed/api'
import type { Network } from '@reverse-djed/txs'
import type { WalletApi } from '@lucid-evolution/lucid'

export const links: Route.LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
]

type LoaderData = {
  apiUrl: string
  network: Network
  config: Record<string, string>
}

export function loader({ context }: LoaderFunctionArgs): LoaderData {
  const { API_URL, NETWORK, CONFIG } = context.cloudflare.env
  if (!API_URL || !NETWORK) throw new Error('Missing env vars')

  return { apiUrl: API_URL, network: NETWORK, config: JSON.parse(CONFIG) }
}

export const ClientContext = createContext<ReturnType<typeof hc<AppType>> | null>(null)
export const EnvContext = createContext<{
  apiUrl: string
  network: Network
  config: Record<string, string>
} | null>(null)
export const WalletContext = createContext<WalletApi | null>(null)

export const useApiClient = () => {
  const ctx = useContext(ClientContext)
  if (!ctx) throw new Error('ClientContext not found')
  return ctx
}

export const useEnv = () => {
  const ctx = useContext(EnvContext)
  if (!ctx) throw new Error('EnvContext not found')
  return ctx
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { apiUrl, network, config } = useLoaderData<LoaderData>()
  const [wallet, setWallet] = useState<WalletApi | null>(null)

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <EnvContext.Provider value={{ apiUrl, network, config }}>
          <WalletContext.Provider value={wallet}>
            <Header setWallet={setWallet} wallet={wallet} />
            {children}
            <ScrollRestoration />
            <Scripts />
          </WalletContext.Provider>
        </EnvContext.Provider>
      </body>
    </html>
  )
}

const queryClient = new QueryClient()

export default function App() {
  const { apiUrl } = useLoaderData<LoaderData>()

  const client = hc<AppType>(apiUrl)

  return (
    <ClientContext.Provider value={client}>
      <QueryClientProvider client={queryClient}>
        <Outlet />
      </QueryClientProvider>
    </ClientContext.Provider>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!'
  let details = 'An unexpected error occurred.'
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error'
    details = error.status === 404 ? 'The requested page could not be found.' : error.statusText || details
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  )
}

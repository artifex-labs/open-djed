import "./app.css"
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from 'react-router'
import { links as fontLinks } from './lib/loader'
import { loader as rootLoader } from './lib/loader'
import { ClientProvider } from './context/ApiClientContext'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { Layout } from './components/Layout'
import type { LoaderData } from './types/loader'


export { fontLinks as links }
export { rootLoader as loader }

const queryClient = new QueryClient()

export default function App() {
  const { apiUrl, network, config } = useLoaderData<LoaderData>()

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <ClientProvider apiUrl={apiUrl}>
          <QueryClientProvider client={queryClient}>
            <Layout apiUrl={apiUrl} network={network} config={config}>
              <Outlet />
            </Layout>
          </QueryClientProvider>
        </ClientProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

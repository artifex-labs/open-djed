import './app.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from 'react-router'
import { links as fontLinks } from './lib/loader'
import { loader as rootLoader } from './lib/loader'
import { ClientProvider } from './context/ApiClientContext'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { Layout } from './components/Layout'
import type { LoaderData } from './types/loader'
import { ThemeProvider } from './context/ThemeContext'

export { fontLinks as links }
export { rootLoader as loader }

const queryClient = new QueryClient()

export default function App() {
  const { apiUrl, network, config, initialIsDark, posthog } = useLoaderData<LoaderData>()

  const initialTheme = initialIsDark === 'dark' ? 'dark' : initialIsDark === 'light' ? 'light' : 'light'

  return (
    <html lang="en" className={initialTheme}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  function getCookie(name) {
                    const value = "; " + document.cookie;
                    const parts = value.split("; " + name + "=");
                    if (parts.length === 2) return parts.pop().split(";").shift();
                  }
                  
                  // Get theme from cookie first, then localStorage, then system preference
                  let theme = getCookie('theme');
                  
                  if (!theme) {
                    theme = localStorage.getItem('theme');
                  }
                  
                  if (!theme) {
                    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    theme = systemPrefersDark ? 'dark' : 'light';
                  }
                  
                  // Apply theme immediately
                  const html = document.documentElement;
                  html.classList.remove('dark', 'light');
                  html.classList.add(theme);
                  
                  // Store the detected theme for the ThemeProvider
                  window.__INITIAL_THEME__ = theme;
                  
                } catch (e) {
                  console.warn('Theme detection failed:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider initialTheme={initialTheme}>
          <ClientProvider apiUrl={apiUrl}>
            <QueryClientProvider client={queryClient}>
              <Layout apiUrl={apiUrl} network={network} config={config} posthog={posthog}>
                <Outlet />
              </Layout>
            </QueryClientProvider>
          </ClientProvider>
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

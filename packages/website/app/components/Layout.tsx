import { PostHogProvider } from 'posthog-js/react'
import posthog from 'posthog-js'
import { Header } from './Header'
import Footer from './Footer'

type Props = {
  children: React.ReactNode
  posthog: {
    key: string
    url: string
  }
}

export function Layout({ children, posthog: posthogConfig }: Props) {
  posthog.init(posthogConfig.key, { api_host: posthogConfig.url })
  return (
    <PostHogProvider client={posthog}>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </PostHogProvider>
  )
}

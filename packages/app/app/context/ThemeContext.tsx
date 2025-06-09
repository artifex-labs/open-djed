import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

// Extend window to include theme detection
declare global {
  interface Window {
    __INITIAL_THEME__?: 'dark' | 'light'
  }
}

function setThemeCookie(theme: 'dark' | 'light') {
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  let cookie = `theme=${theme}; Path=/; Max-Age=${60 * 60 * 24 * 365}`
  if (!isLocalhost) {
    cookie += '; Domain=.artifex.finance'
  }
  document.cookie = cookie
}

function getThemeCookie(): 'dark' | 'light' | null {
  const match = document.cookie.match(/(?:^|; )theme=(dark|light)(?:;|$)/)
  return match ? (match[1] as 'dark' | 'light') : null
}

type ThemeContextType = {
  isDarkMode: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
})

interface ThemeProviderProps {
  children: ReactNode
  initialTheme?: 'dark' | 'light'
}

export function ThemeProvider({ children, initialTheme = 'light' }: ThemeProviderProps) {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // For SSR, use the initial theme
    if (typeof window === 'undefined') {
      return initialTheme === 'dark'
    }

    // On client, use the theme detected by inline script
    if (window.__INITIAL_THEME__) {
      return window.__INITIAL_THEME__ === 'dark'
    }

    // Fallback to the same detection logic
    const cookieTheme = getThemeCookie()
    if (cookieTheme) {
      return cookieTheme === 'dark'
    }

    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      return savedTheme === 'dark'
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const html = document.documentElement

    if (isDarkMode) {
      html.classList.add('dark')
      html.classList.remove('light')
    } else {
      html.classList.remove('dark')
      html.classList.add('light')
    }

    // Only save to storage after hydration to avoid hydration mismatches
    if (isHydrated) {
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')
      setThemeCookie(isDarkMode ? 'dark' : 'light')
    }
  }, [isDarkMode, isHydrated])

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev)
  }

  return <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)

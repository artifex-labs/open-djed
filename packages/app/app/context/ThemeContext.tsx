import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

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

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false

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

  useEffect(() => {
    const html = document.documentElement
    if (isDarkMode) {
      html.classList.add('dark')
      html.classList.remove('light')
    } else {
      html.classList.remove('dark')
      html.classList.add('light')
    }

    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')
    setThemeCookie(isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev)
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)

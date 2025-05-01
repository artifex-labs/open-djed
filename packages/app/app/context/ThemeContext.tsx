import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type ThemeContextType = {
  isDarkMode: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme')
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const initialTheme = savedTheme ? savedTheme === 'dark' : systemDark
      setIsDarkMode(initialTheme)

      const html = document.documentElement
      html.classList.toggle('dark', initialTheme)
      html.classList.toggle('light', !initialTheme)
    }
  }, [])

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newTheme = !prev
      const html = document.documentElement
      html.classList.toggle('dark', newTheme)
      html.classList.toggle('light', !newTheme)
      localStorage.setItem('theme', newTheme ? 'dark' : 'light')
      return newTheme
    })
  }

  return <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)

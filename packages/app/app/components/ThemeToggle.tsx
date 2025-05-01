import { useTheme } from '../context/ThemeContext'
import { FiSun, FiMoon } from 'react-icons/fi'
import Button from './Button'

export const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme()

  return (
    <Button onClick={toggleTheme} className="text-white transition-colors">
      {isDarkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
    </Button>
  )
}

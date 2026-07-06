import { createContext, useCallback, useContext, useEffect, useState } from 'react'

// Theme lives on <html data-theme="..."> so the existing CSS custom properties keep
// working unchanged. Persisted to the same localStorage key the old site used, so
// visitors keep their preference across the migration.
const ThemeContext = createContext({ theme: 'light', setTheme: () => {}, toggleTheme: () => {} })

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(
    () => localStorage.getItem('classconnect-theme') || document.documentElement.getAttribute('data-theme') || 'light'
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('classconnect-theme', theme)
  }, [theme])

  const setTheme = useCallback(t => setThemeState(t), [])
  const toggleTheme = useCallback(() => setThemeState(t => (t === 'dark' ? 'light' : 'dark')), [])

  return <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)

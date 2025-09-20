import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
}

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({
  children,
  defaultTheme = "system",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    if (theme === "system") {
      const isNightTime = () => {
        const hours = new Date().getHours()
        return hours < 6 || hours >= 18 // Dark mode between 6 PM and 6 AM
      }

      const systemTheme = isNightTime() ? "dark" : "light"
      root.classList.add(systemTheme)

      // Set up interval to check time every minute
      const interval = setInterval(() => {
        root.classList.remove("light", "dark")
        root.classList.add(isNightTime() ? "dark" : "light")
      }, 60000)

      return () => clearInterval(interval)
    }

    root.classList.add(theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")
  return context
}
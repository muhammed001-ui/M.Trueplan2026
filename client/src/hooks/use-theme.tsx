import { createContext, useContext, useEffect, useState } from "react";

type Theme = "earth" | "neon" | "vampire" | "minimal";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Try to recover theme from storage
    const stored = localStorage.getItem("schedule-app-theme");
    return (stored as Theme) || "earth";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    // Remove old theme
    root.removeAttribute("data-theme");
    // Set new theme
    root.setAttribute("data-theme", theme);
    // Persist
    localStorage.setItem("schedule-app-theme", theme);
  }, [theme]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

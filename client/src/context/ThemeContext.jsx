import React, { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

const THEMES = ["dark", "light"];

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem("theme");
    return THEMES.includes(stored) ? stored : "dark";
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const nextTheme = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
  const toggleTheme = () => setTheme(nextTheme);

  return (
    <ThemeContext.Provider
      value={{ theme, effectiveTheme: theme, nextTheme, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

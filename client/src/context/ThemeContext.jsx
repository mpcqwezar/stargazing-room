import React, { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

const BASE_THEMES = ["dark", "light"];

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem("theme");
    return stored || "dark";
  });

  // Pages opt into retro; elsewhere a stored retro choice falls back to dark.
  const [retroAllowed, setRetroAllowed] = useState(false);

  const effectiveTheme = theme === "retro" && !retroAllowed ? "dark" : theme;

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", effectiveTheme);
  }, [theme, effectiveTheme]);

  // Cycling from what is on screen keeps the button usable on pages without retro.
  const cycle = retroAllowed ? [...BASE_THEMES, "retro"] : BASE_THEMES;
  const nextTheme = cycle[(cycle.indexOf(effectiveTheme) + 1) % cycle.length];
  const toggleTheme = () => setTheme(nextTheme);

  return (
    <ThemeContext.Provider
      value={{ theme, effectiveTheme, nextTheme, toggleTheme, retroAllowed, setRetroAllowed }}
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

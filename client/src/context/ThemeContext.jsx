import React, { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem("theme");
    return stored || "dark";
  });

  const [pageTheme, setPageTheme] = useState(null); // null means use global theme

  // What is actually on screen: a page override wins over the global choice.
  const effectiveTheme = pageTheme !== null ? pageTheme : theme;

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", effectiveTheme);
  }, [theme, effectiveTheme]);

  const toggleTheme = () => {
    // Don't toggle theme if we're on a page-specific theme
    if (pageTheme !== null) return;

    setTheme(prev => {
      if (prev === "dark") return "light";
      if (prev === "light") return "retro";
      return "dark";
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, effectiveTheme, toggleTheme, pageTheme, setPageTheme }}>
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

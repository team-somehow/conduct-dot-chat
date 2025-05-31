import { useState, useEffect } from "react";

type Theme = "light" | "dark";

export const useTheme = () => {
  // Check if we're in the browser
  const isBrowser = typeof window !== "undefined";

  // Get initial theme from localStorage or default to light
  const getInitialTheme = (): Theme => {
    if (isBrowser) {
      const savedTheme = localStorage.getItem("theme") as Theme | null;

      // If theme is saved in localStorage, use that
      if (savedTheme) {
        return savedTheme;
      }

      // Default to light theme for Neo-Brutalist design
      // (instead of checking system preference)
      return "light";
    }

    // Default to light theme on server
    return "light";
  };

  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  // Update theme in localStorage and apply to document
  const setTheme = (newTheme: Theme) => {
    if (isBrowser) {
      localStorage.setItem("theme", newTheme);

      // Apply theme to document
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }

    setThemeState(newTheme);
  };

  // Apply theme when component mounts
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return { theme, setTheme };
};

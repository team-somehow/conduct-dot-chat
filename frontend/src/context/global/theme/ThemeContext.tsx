import { createContext, PropsWithChildren, JSX } from "react";
import { useTheme } from "../../../hooks/useTheme";

interface ThemeContextType {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const ThemeContext = createContext<ThemeContextType>(
  {} as ThemeContextType
);

export const ThemeProvider = (
  props: PropsWithChildren<unknown>
): JSX.Element => {
  const themeHook = useTheme();

  return (
    <ThemeContext.Provider value={themeHook}>
      {props.children}
    </ThemeContext.Provider>
  );
};

export const ThemeConsumer = ThemeContext.Consumer;

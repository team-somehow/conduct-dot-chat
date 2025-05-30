import {
  createContext,
  useEffect,
  useState,
  PropsWithChildren,
  JSX,
} from "react";
import { auth, googleProvider } from "@/config/firebase";
import {
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

interface ContextValueType {
  user: User | null;
  authLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<ContextValueType>(
  {} as ContextValueType
);

export const AuthProvider = (
  props: PropsWithChildren<unknown>
): JSX.Element => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<void> => {
    setAuthLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Signed in with Google:", result.user);
    } catch (error) {
      console.error("Error signing in with Google:", error);
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setAuthLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      console.log("User signed out");
      // optional delay to avoid flicker on login page
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, authLoading, signInWithGoogle, logout }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export const AuthConsumer = AuthContext.Consumer;

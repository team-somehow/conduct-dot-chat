import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/global/auth/AuthContext";
import { ThemeContext } from "@/context/global/theme/ThemeContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Moon, Sun } from "lucide-react";

const Login = () => {
  const { user, authLoading, signInWithGoogle } = useContext(AuthContext);
  const { theme, setTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if user is already logged in and auth is not loading
    if (!authLoading && user) {
      navigate("/sales"); // Redirect to app dashboard
    }
  }, [user, authLoading, navigate]);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      // Navigation will happen in the useEffect hook upon successful login
    } catch (error) {
      console.error("Login failed:", error);
      // Handle login error (e.g., show a message to the user)
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Optional: Show loading state while checking auth status
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Prevent rendering login button if user is already logged in (avoids flicker before redirect)
  if (user) {
    return null; // Or a loading/redirecting message
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full"
          title={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>

      <Card className="p-8 w-full max-w-sm text-center shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-foreground">Login</h2>
        <p className="text-muted-foreground mb-6">
          Please sign in to continue.
        </p>
        <Button
          onClick={handleLogin}
          disabled={authLoading}
          className="w-full"
          size="lg"
        >
          {authLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in with Google"
          )}
        </Button>
      </Card>
    </div>
  );
};

export default Login;

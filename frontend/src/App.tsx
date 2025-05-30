import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from "./context/global/auth/AuthContext";
import { ThemeProvider } from "./context/global/theme/ThemeContext";
import { Toaster } from "sonner";

// TODO(App):
// 1. Add global error boundary
// 2. Implement theme provider
// 3. Add loading states
// 4. Create global toast notifications
// 5. Add authentication provider
// END TODO

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <RouterProvider router={router} />
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;

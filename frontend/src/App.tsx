import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/context';
import { router } from '@/router';

/**
 * Root application component.
 * Wraps the router with all global context providers.
 */
export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

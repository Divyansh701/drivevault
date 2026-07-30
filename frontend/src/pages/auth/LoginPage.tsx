import { Navigate } from 'react-router-dom';

/**
 * Legacy /login route — redirects to /login/user (default portal)
 */
export default function LoginPage() {
  return <Navigate to="/login/user" replace />;
}

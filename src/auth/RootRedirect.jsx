import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

/** App entry: unauthenticated users land on login; signed-in users go to the dashboard. */
export default function RootRedirect() {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
}

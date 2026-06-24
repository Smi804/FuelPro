import { useAuth } from './AuthContext.jsx';

/**
 * Conditionally render children when the current user holds a permission.
 * Usage: <Can perm="sales:create"><button/></Can>
 * Pass `fallback` to render an alternative when denied.
 */
export default function Can({ perm, children, fallback = null }) {
  const { can } = useAuth();
  return can(perm) ? children : fallback;
}

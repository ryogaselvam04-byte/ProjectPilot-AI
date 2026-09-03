import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

// Convenience hook: const { user, login, register, logout } = useAuth();
export const useAuth = () => useContext(AuthContext);

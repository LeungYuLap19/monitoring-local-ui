import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginNgo, bootstrapSessionWithToken } from '../../lib/services/authService';
import { isAuthApiError } from '../../lib/utils/auth';

export function useNgoAuth() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = useCallback(async () => {
    if (!email.trim() || !password) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await loginNgo(email.trim(), password);
      await bootstrapSessionWithToken(result.token, 'ngo', result.ngoId);
      navigate('/', { replace: true });
    } catch (err) {
      if (isAuthApiError(err)) {
        setError(err.message);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [email, navigate, password]);

  return {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    error,
    handleLogin,
  };
}

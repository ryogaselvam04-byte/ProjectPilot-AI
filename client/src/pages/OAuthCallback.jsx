import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// After Google/GitHub/Microsoft login, the backend redirects here with
// ?token=<jwt>. We store it, fetch the profile, then continue to the dashboard.
const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setError('No login token received. Please try again.');
      return;
    }
    loginWithToken(token)
      .then(() => navigate('/dashboard', { replace: true }))
      .catch(() => setError('Could not complete sign-in. Please try again.'));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="text-center">
        {error ? (
          <>
            <p className="text-sm text-red-400 mb-3">{error}</p>
            <button onClick={() => navigate('/login')} className="text-goldSoft text-sm font-bold underline">
              Back to login
            </button>
          </>
        ) : (
          <>
            <div className="w-8 h-8 mx-auto mb-3 rounded-full border-2 border-goldDim border-t-gold animate-spin" />
            <p className="text-sm text-inkDim">Signing you in...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;

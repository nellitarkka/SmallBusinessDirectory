import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { verifyEmail } from '../services/api';
import '../css/VerifyEmailPage.css';

function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const hasVerifiedRef = useRef(false);
  const redirectTimeoutRef = useRef<number | null>(null);

  const getRedirectPath = (role?: string) => {
    if (role === 'vendor') return '/login/vendor';
    if (role === 'admin') return '/login/admin';
    if (role === 'customer') return '/login/customer';
    return '/';
  };

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    if (hasVerifiedRef.current) {
      return;
    }

    const performVerification = async () => {
      try {
        hasVerifiedRef.current = true;
        const response = await verifyEmail(token);
        
        if (response.status === 'success') {
          setStatus('success');
          setMessage('Email verified successfully! Redirecting...');

          const role = response?.data?.user?.role as string | undefined;
          const redirectPath = getRedirectPath(role);
          redirectTimeoutRef.current = window.setTimeout(() => {
            navigate(redirectPath);
          }, 500);
        } else {
          setStatus('error');
          setMessage(response.message || 'Failed to verify email');
        }
      } catch (error) {
        setStatus('error');
        setMessage(
          error instanceof Error
            ? error.message
            : 'An error occurred while verifying your email'
        );
      }
    };

    performVerification();
    return () => {
      if (redirectTimeoutRef.current !== null) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [token, navigate]);

  return (
    <div className="verify-email-container">
      <div className="verify-email-card">
        {status === 'loading' && (
          <>
            <div className="spinner"></div>
            <h2>Verifying your email...</h2>
            <p>Please wait while we confirm your email address.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="success-icon">✓</div>
            <h2>Email Verified!</h2>
            <p>{message}</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="error-icon">✕</div>
            <h2>Verification Failed</h2>
            <p>{message}</p>
            <button 
              onClick={() => navigate('/')}
              className="btn-primary"
            >
              Return to Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default VerifyEmailPage;

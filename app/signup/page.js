'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../auth.module.css';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  function getFriendlyError(message) {
    const lower = message.toLowerCase();
    if (lower.includes('rate limit') || lower.includes('too many requests')) {
      return 'Too many signup attempts. Please wait a minute and try again.';
    }
    if (lower.includes('already registered') || lower.includes('already been registered')) {
      return 'This email is already registered. Try logging in instead.';
    }
    if (lower.includes('invalid email')) {
      return 'Please enter a valid email address.';
    }
    if (lower.includes('password')) {
      return 'Password must be at least 6 characters long.';
    }
    return message;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);

    try {
      const data = await signUp(email, password);
      
      // Check if email confirmation is required
      if (data?.user?.identities?.length === 0) {
        setError('This email is already registered. Try logging in instead.');
        setIsLoading(false);
        return;
      }

      // If user is confirmed immediately (email confirmation disabled in Supabase)
      if (data?.session) {
        router.push('/profile');
        return;
      }

      // If email confirmation is enabled, show success message
      setSuccess('Account created! Check your email inbox to verify your account, then log in.');
      setIsLoading(false);
    } catch (err) {
      setError(getFriendlyError(err.message || 'Failed to create an account.'));
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h1 className={styles.title}>Create Account</h1>
        <p className={styles.subtitle}>Join Deadline to find study partners.</p>
        
        {error && <div className={styles.errorBox}>{error}</div>}
        {success && <div className={styles.successBox}>{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className="label">University Email</label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="you@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="password" className="label">Password (min. 6 characters)</label>
            <input
              id="password"
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          
          <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        <div className={styles.authFooter}>
          Already have an account? 
          <Link href="/login" className={styles.authLink}>
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}

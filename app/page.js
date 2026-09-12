'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/feed');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className="skeleton" style={{ width: 60, height: 60, borderRadius: '50%' }} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <div className={styles.heroBadge}>
          <span className="pulse-dot"></span>
          Urgent study sessions
        </div>
        <h1 className={styles.title}>
          Never study for that exam <span className={styles.highlight}>alone</span> again.
        </h1>
        <p className={styles.subtitle}>
          Deadline connects you with classmates who need to study for the same exact thing, right now. No more noisy group chats or asking around.
        </p>
        
        <div className={styles.ctaGroup}>
          <Link href="/signup" className="btn btn-primary btn-lg">
            Find a Study Group
          </Link>
          <Link href="/login" className="btn btn-secondary btn-lg">
            Log In
          </Link>
        </div>
      </div>

      <div className={styles.features}>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>⏳</div>
          <h3>Urgency-Driven</h3>
          <p>Sessions are sorted by what's happening soonest. Find groups for tomorrow's exam instantly.</p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>🎯</div>
          <h3>Highly Specific</h3>
          <p>Filter by course code and exact topic. Don't waste time in generic study spaces.</p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>🤝</div>
          <h3>Zero Friction</h3>
          <p>See how many spots are left and who's going. One click to join and reserve your spot.</p>
        </div>
      </div>
    </div>
  );
}

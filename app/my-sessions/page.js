'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { sortByUrgency } from '@/lib/utils';
import { isPast } from 'date-fns';
import AuthGuard from '@/components/AuthGuard';
import SessionCard from '@/components/SessionCard';
import styles from './page.module.css';

export default function MySessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMySessions();
    }
  }, [user]);

  async function fetchMySessions() {
    try {
      // Get sessions the user created OR joined
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          *,
          profiles:creator_id(full_name, avatar_url),
          session_joins!inner(user_id),
          all_joins:session_joins(count)
        `)
        .eq('session_joins.user_id', user.id);
        
      if (error) throw error;

      const formattedData = data.map(session => ({
        ...session,
        join_count: session.all_joins[0].count
      }));

      setSessions(formattedData);
    } catch (error) {
      console.error('Error fetching my sessions:', error);
    } finally {
      setLoading(false);
    }
  }

  // Split into upcoming and past
  const upcomingSessions = sortByUrgency(
    sessions.filter(s => !isPast(new Date(s.session_date)))
  );
  
  const pastSessions = sessions
    .filter(s => isPast(new Date(s.session_date)))
    .sort((a, b) => new Date(b.session_date) - new Date(a.session_date)); // Newest past first

  return (
    <AuthGuard>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>My Sessions</h1>
          <p className={styles.subtitle}>Study groups you've joined or created.</p>
        </div>

        {loading ? (
          <div className={styles.loadingGrid}>
            {[1, 2, 3].map(i => (
              <div key={i} className={`skeleton ${styles.skeletonCard}`} />
            ))}
          </div>
        ) : (
          <>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                Upcoming <span className={styles.badge}>{upcomingSessions.length}</span>
              </h2>
              {upcomingSessions.length > 0 ? (
                <div className={styles.grid}>
                  {upcomingSessions.map(session => (
                    <SessionCard key={session.id} session={session} />
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <p>You have no upcoming study sessions.</p>
                </div>
              )}
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                Past <span className={styles.badge}>{pastSessions.length}</span>
              </h2>
              {pastSessions.length > 0 ? (
                <div className={styles.grid}>
                  {pastSessions.map(session => (
                    <SessionCard key={session.id} session={session} />
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <p>Your past sessions will appear here.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AuthGuard>
  );
}

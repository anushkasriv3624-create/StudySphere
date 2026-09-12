'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { sortByUrgency } from '@/lib/utils';
import AuthGuard from '@/components/AuthGuard';
import SessionCard from '@/components/SessionCard';
import { Search } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';

export default function Feed() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSessions();
    
    // Subscribe to real-time changes
    const subscription = supabase
      .channel('public:sessions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, () => {
        fetchSessions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  async function fetchSessions() {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          *,
          profiles:creator_id(full_name, avatar_url),
          session_joins(count)
        `)
        .order('session_date', { ascending: true });
        
      if (error) throw error;

      // Transform the count to a flat property
      const formattedData = data.map(session => ({
        ...session,
        join_count: session.session_joins[0].count
      }));

      setSessions(formattedData);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  }

  // Filter and sort sessions
  const filteredSessions = sessions.filter(session => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      session.course_name.toLowerCase().includes(query) ||
      session.topic.toLowerCase().includes(query) ||
      (session.description && session.description.toLowerCase().includes(query))
    );
  });

  const sortedSessions = sortByUrgency(filteredSessions);

  return (
    <AuthGuard>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              Happening Soon
              <span className="pulse-dot" style={{ color: 'var(--success)' }}></span>
            </h1>
            <p className={styles.subtitle}>Join a study session before the deadline.</p>
          </div>
          
          <div className={styles.filters}>
            <div className={styles.searchWrapper}>
              <Search className={styles.searchIcon} size={18} />
              <input 
                type="text" 
                className={`input ${styles.searchInput}`} 
                placeholder="Search by course or topic..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className={styles.loadingGrid}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className={`skeleton ${styles.skeletonCard}`} />
            ))}
          </div>
        ) : sortedSessions.length > 0 ? (
          <div className={styles.grid}>
            {sortedSessions.map(session => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔍</div>
            <h3>No sessions found</h3>
            <p>
              {searchQuery 
                ? `Nobody is studying "${searchQuery}" right now. Why not be the first to start a group?`
                : "It's quiet... too quiet. Post a session to find study partners for your upcoming assignments."}
            </p>
            <Link href="/sessions/new" className="btn btn-primary">
              Post a Study Session
            </Link>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}

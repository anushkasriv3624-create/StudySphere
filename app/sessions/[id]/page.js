'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { getSessionStatus, formatSessionDate, getCapacityColor, getInitials } from '@/lib/utils';
import { ArrowLeft, Calendar, MapPin, Users, Clock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import CountdownTimer from '@/components/CountdownTimer';
import styles from './page.module.css';

export default function SessionDetail({ params }) {
  const { id } = params;
  const { user } = useAuth();
  const router = useRouter();
  
  const [session, setSession] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSessionDetails();

    // Subscribe to join/leave changes
    const subscription = supabase
      .channel(`session:${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'session_joins', filter: `session_id=eq.${id}` }, () => {
        fetchSessionDetails();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [id]);

  async function fetchSessionDetails() {
    try {
      // Fetch session data
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select(`
          *,
          profiles:creator_id(full_name, avatar_url, major, year)
        `)
        .eq('id', id)
        .single();

      if (sessionError) throw sessionError;

      // Fetch attendees
      const { data: attendeesData, error: attendeesError } = await supabase
        .from('session_joins')
        .select(`
          user_id,
          joined_at,
          profiles:user_id(full_name, avatar_url, major, year)
        `)
        .eq('session_id', id)
        .order('joined_at', { ascending: true });

      if (attendeesError) throw attendeesError;

      setSession(sessionData);
      setAttendees(attendeesData);
    } catch (err) {
      console.error(err);
      setError('Could not load session details.');
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('session_joins')
        .insert([{ session_id: id, user_id: user.id }]);
        
      if (error) throw error;
      await fetchSessionDetails();
    } catch (err) {
      console.error(err);
      alert('Failed to join session. It might be full.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleLeave() {
    if (!confirm('Are you sure you want to leave this study group?')) return;
    
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('session_joins')
        .delete()
        .match({ session_id: id, user_id: user.id });
        
      if (error) throw error;
      await fetchSessionDetails();
    } catch (err) {
      console.error(err);
      alert('Failed to leave session.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this session? This action cannot be undone.')) return;
    
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      router.push('/my-sessions');
    } catch (err) {
      console.error(err);
      alert('Failed to delete session.');
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className={styles.loadingContainer}>
          <div className="skeleton" style={{ width: 60, height: 60, borderRadius: '50%' }} />
        </div>
      </AuthGuard>
    );
  }

  if (error || !session) {
    return (
      <AuthGuard>
        <div className={styles.container}>
          <Link href="/feed" className={styles.backLink}>
            <ArrowLeft size={16} /> Back to Feed
          </Link>
          <div className={styles.card}>
            <h2>Session not found</h2>
            <p>This session may have been deleted.</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  const status = getSessionStatus(session.session_date);
  const isPast = status.type === 'past';
  const hasJoined = attendees.some(a => a.user_id === user.id);
  const isCreator = session.creator_id === user.id;
  const isFull = attendees.length >= session.max_capacity;
  const capacityColor = getCapacityColor(attendees.length, session.max_capacity);

  return (
    <AuthGuard>
      <div className={styles.container}>
        <Link href="/feed" className={styles.backLink}>
          <ArrowLeft size={16} /> Back to Feed
        </Link>

        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.course}>{session.course_name}</div>
            <h1 className={styles.title}>{session.topic}</h1>
            <div className={styles.badges}>
              <span className={`badge badge-${status.type}`}>
                {status.type === 'live' && <span className="pulse-dot"></span>}
                {status.label}
              </span>
              {session.location_type === 'online' && (
                <span className="badge badge-online">Online</span>
              )}
            </div>
          </div>

          <div className={styles.metaGrid}>
            <div className={styles.metaItem}>
              <div className={styles.metaIcon}>
                <Calendar size={20} />
              </div>
              <div className={styles.metaContent}>
                <span className={styles.metaLabel}>Date & Time</span>
                <span className={styles.metaValue}>
                  {formatSessionDate(session.session_date)}
                </span>
                {status.type === 'live' && (
                  <CountdownTimer targetDate={session.session_date} />
                )}
              </div>
            </div>

            <div className={styles.metaItem}>
              <div className={styles.metaIcon}>
                <MapPin size={20} />
              </div>
              <div className={styles.metaContent}>
                <span className={styles.metaLabel}>Location</span>
                <span className={styles.metaValue}>{session.location}</span>
              </div>
            </div>
          </div>

          {session.description && (
            <div className={styles.description}>
              <h3>Details</h3>
              <p>{session.description}</p>
            </div>
          )}

          <div className={styles.attendees}>
            <div className={styles.attendeesHeader}>
              <h3 className={styles.attendeesTitle}>Study Group Members</h3>
              <span className={styles.capacityText} style={{ color: capacityColor }}>
                {attendees.length} / {session.max_capacity} filled
              </span>
            </div>

            <div className={styles.attendeeList}>
              {attendees.map((attendee) => (
                <div key={attendee.user_id} className={styles.attendee}>
                  {attendee.profiles.avatar_url ? (
                    <img src={attendee.profiles.avatar_url} alt="" className="avatar" />
                  ) : (
                    <div className="avatar avatar-placeholder">
                      {getInitials(attendee.profiles.full_name)}
                    </div>
                  )}
                  <div className={styles.attendeeInfo}>
                    <span className={styles.attendeeName}>
                      {attendee.profiles.full_name || 'Anonymous Student'}
                      {attendee.user_id === session.creator_id && (
                        <span className={styles.creatorBadge}>Host</span>
                      )}
                    </span>
                    {(attendee.profiles.major || attendee.profiles.year) && (
                      <span className={styles.attendeeDetails}>
                        {attendee.profiles.major} {attendee.profiles.year ? `· Year ${attendee.profiles.year}` : ''}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.actions}>
            {isCreator ? (
              <button 
                className="btn btn-danger" 
                onClick={handleDelete}
                disabled={actionLoading}
              >
                Delete Session
              </button>
            ) : hasJoined ? (
              <button 
                className="btn btn-secondary" 
                onClick={handleLeave}
                disabled={actionLoading || isPast}
              >
                Leave Group
              </button>
            ) : (
              <button 
                className="btn btn-primary" 
                onClick={handleJoin}
                disabled={actionLoading || isFull || isPast}
              >
                {isPast ? 'Session Ended' : isFull ? 'Group is Full' : 'Join Study Group'}
              </button>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}

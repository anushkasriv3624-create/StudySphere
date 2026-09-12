'use client';

import Link from 'next/link';
import { Calendar, MapPin, Users } from 'lucide-react';
import { getSessionStatus, formatSessionDate, getCapacityColor, getInitials } from '@/lib/utils';
import CountdownTimer from './CountdownTimer';
import styles from './SessionCard.module.css';

export default function SessionCard({ session }) {
  const status = getSessionStatus(session.session_date);
  const isPast = status.type === 'past';
  const isFull = session.join_count >= session.max_capacity;
  
  // Calculate capacity color
  const capacityColor = getCapacityColor(session.join_count, session.max_capacity);

  return (
    <Link 
      href={`/sessions/${session.id}`} 
      className={`${styles.card} ${isPast ? styles.cardPast : ''}`}
    >
      <div className={styles.header}>
        <div className={styles.course}>{session.course_name}</div>
        <div className={styles.badges}>
          <span className={`badge badge-${status.type}`}>
            {status.type === 'live' && <span className="pulse-dot"></span>}
            {status.label}
          </span>
        </div>
      </div>
      
      <h3 className={styles.title}>{session.topic}</h3>
      
      {session.description && (
        <p className={styles.description}>{session.description}</p>
      )}
      
      <div className={styles.meta}>
        <div className={styles.metaItem}>
          <Calendar size={16} className={styles.metaIcon} />
          <span>
            {formatSessionDate(session.session_date)}
            {status.type === 'live' && <CountdownTimer targetDate={session.session_date} />}
          </span>
        </div>
        <div className={styles.metaItem}>
          <MapPin size={16} className={styles.metaIcon} />
          <span>{session.location}</span>
          {session.location_type === 'online' && (
            <span className="badge badge-online">Online</span>
          )}
        </div>
      </div>
      
      <div className={styles.footer}>
        <div className={styles.attendees}>
          <div className={styles.avatarGroup}>
            {/* Show creator avatar if possible, or placeholder */}
            <div className="avatar avatar-sm avatar-placeholder" style={{ zIndex: 3 }}>
              {getInitials(session.profiles?.full_name)}
            </div>
            {/* Mock other attendees visually if join_count > 1 */}
            {session.join_count > 1 && (
              <div className="avatar avatar-sm avatar-placeholder" style={{ zIndex: 2, background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                +{session.join_count - 1}
              </div>
            )}
          </div>
          <span className={styles.capacityText} style={{ color: capacityColor }}>
            {session.join_count}/{session.max_capacity} filled
          </span>
        </div>
        
        <div className={styles.action}>
          <span className={`btn btn-sm ${isPast ? 'btn-secondary' : 'btn-primary'}`}>
            {isPast ? 'View Details' : 'Join'}
          </span>
        </div>
      </div>
    </Link>
  );
}

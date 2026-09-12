'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import { MapPin, Monitor } from 'lucide-react';
import styles from './page.module.css';
import Link from 'next/link';

export default function CreateSession() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Need to set minimum datetime to now
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const minDateTime = now.toISOString().slice(0, 16);
  
  const [formData, setFormData] = useState({
    course_name: '',
    topic: '',
    description: '',
    session_date: '',
    location_type: 'in_person',
    location: '',
    max_capacity: 4
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Create the session
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .insert([{
          creator_id: user.id,
          course_name: formData.course_name.toUpperCase(),
          topic: formData.topic,
          description: formData.description,
          session_date: new Date(formData.session_date).toISOString(),
          location_type: formData.location_type,
          location: formData.location,
          max_capacity: parseInt(formData.max_capacity)
        }])
        .select()
        .single();

      if (sessionError) throw sessionError;

      // 2. Automatically join the creator to their own session
      const { error: joinError } = await supabase
        .from('session_joins')
        .insert([{
          session_id: sessionData.id,
          user_id: user.id
        }]);

      if (joinError) throw joinError;

      // Redirect to the new session
      router.push(`/sessions/${sessionData.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create session');
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>Post a Study Session</h1>
            <p className={styles.subtitle}>Find classmates to study with right now.</p>
          </div>

          {error && <div className={styles.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="course_name" className="label">Course Code *</label>
                <input
                  id="course_name"
                  name="course_name"
                  type="text"
                  className="input"
                  placeholder="e.g. CS201"
                  value={formData.course_name}
                  onChange={handleChange}
                  required
                  maxLength={15}
                  style={{ textTransform: 'uppercase' }}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="topic" className="label">Topic / Focus *</label>
                <input
                  id="topic"
                  name="topic"
                  type="text"
                  className="input"
                  placeholder="e.g. Midterm Review"
                  value={formData.topic}
                  onChange={handleChange}
                  required
                  maxLength={50}
                />
              </div>

              <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                <label htmlFor="description" className="label">Details (Optional)</label>
                <textarea
                  id="description"
                  name="description"
                  className="input"
                  placeholder="What specifically are you working on? Any materials they should bring?"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  maxLength={300}
                />
              </div>

              <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                <label htmlFor="session_date" className="label">When is it? *</label>
                <input
                  id="session_date"
                  name="session_date"
                  type="datetime-local"
                  className="input"
                  min={minDateTime}
                  value={formData.session_date}
                  onChange={handleChange}
                  required
                />
                <span className={styles.helperText}>Sessions happening within 24 hours get priority visibility.</span>
              </div>

              <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                <label className="label">Format *</label>
                <div className={styles.radioGroup}>
                  <div>
                    <input
                      type="radio"
                      id="in_person"
                      name="location_type"
                      value="in_person"
                      className={styles.radioInput}
                      checked={formData.location_type === 'in_person'}
                      onChange={handleChange}
                    />
                    <label htmlFor="in_person" className={styles.radioLabel}>
                      <MapPin size={18} /> In Person
                    </label>
                  </div>
                  <div>
                    <input
                      type="radio"
                      id="online"
                      name="location_type"
                      value="online"
                      className={styles.radioInput}
                      checked={formData.location_type === 'online'}
                      onChange={handleChange}
                    />
                    <label htmlFor="online" className={styles.radioLabel}>
                      <Monitor size={18} /> Online
                    </label>
                  </div>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="location" className="label">
                  {formData.location_type === 'in_person' ? 'Location (Building/Room) *' : 'Meeting Link *'}
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  className="input"
                  placeholder={formData.location_type === 'in_person' ? 'e.g. Library 3rd Floor' : 'e.g. Zoom link or Discord'}
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="max_capacity" className="label">Max Group Size *</label>
                <select
                  id="max_capacity"
                  name="max_capacity"
                  className="input"
                  value={formData.max_capacity}
                  onChange={handleChange}
                  required
                >
                  {[2, 3, 4, 5, 6, 8, 10, 15, 20].map(num => (
                    <option key={num} value={num}>{num} people</option>
                  ))}
                </select>
                <span className={styles.helperText}>Includes you.</span>
              </div>
            </div>

            <div className={styles.footer}>
              <Link href="/feed" className="btn btn-ghost">
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating...' : 'Post Session'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthGuard>
  );
}

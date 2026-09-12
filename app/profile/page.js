'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { getInitials } from '@/lib/utils';
import { Upload } from 'lucide-react';
import styles from './page.module.css';

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();
  
  const [fullName, setFullName] = useState('');
  const [major, setMajor] = useState('');
  const [year, setYear] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setMajor(profile.major || '');
      setYear(profile.year || '');
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  async function uploadAvatar(event) {
    try {
      setUploading(true);
      setError('');

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
    } catch (error) {
      setError(error.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updates = {
        id: user.id,
        full_name: fullName,
        major,
        year: parseInt(year) || null,
        bio,
        avatar_url: avatarUrl,
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      
      if (error) throw error;
      
      setSuccess('Profile updated successfully!');
      await refreshProfile();
      
      // If they just signed up and filled profile, take them to feed
      if (!profile?.full_name && fullName) {
        setTimeout(() => router.push('/feed'), 1000);
      }
    } catch (error) {
      setError(error.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthGuard>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>Your Profile</h1>
            <p className={styles.subtitle}>Help others know who they are studying with.</p>
          </div>

          {error && <div className={styles.errorBox}>{error}</div>}
          {success && <div className={styles.successBox}>{success}</div>}

          <div className={styles.avatarSection}>
            <div className={styles.avatarContainer}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className={styles.avatar} />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {getInitials(fullName)}
                </div>
              )}
            </div>
            
            <label className={styles.uploadLabel}>
              <Upload size={16} />
              {uploading ? 'Uploading...' : 'Upload Picture'}
              <input
                type="file"
                accept="image/*"
                onChange={uploadAvatar}
                disabled={uploading}
                className={styles.hiddenInput}
              />
            </label>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="fullName" className="label">Full Name *</label>
              <input
                id="fullName"
                type="text"
                className="input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="major" className="label">Major / Program</label>
                <input
                  id="major"
                  type="text"
                  className="input"
                  placeholder="e.g. Computer Science"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="year" className="label">Year of Study</label>
                <select
                  id="year"
                  className="input"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                >
                  <option value="">Select Year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                  <option value="5">5th+ Year / Grad</option>
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="bio" className="label">Short Bio (Optional)</label>
              <textarea
                id="bio"
                className="input"
                rows="3"
                placeholder="What are your study habits? Do you like quiet studying or discussion?"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading || uploading}>
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>
      </div>
    </AuthGuard>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getInitials } from '@/lib/utils';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  async function handleSignOut() {
    await signOut();
    router.push('/');
  }

  function isActive(path) {
    return pathname === path ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink;
  }

  if (!user) return null;

  return (
    <nav className={styles.nav}>
      <div className={styles.navInner}>
        <Link href="/feed" className={styles.logo}>
          <span className={styles.logoIcon}>⏰</span>
          StudySphere 📖
        </Link>

        <div className={styles.navLinks}>
          <Link href="/feed" className={isActive('/feed')}>Feed</Link>
          <Link href="/sessions/new" className={isActive('/sessions/new')}>Create</Link>
          <Link href="/my-sessions" className={isActive('/my-sessions')}>My Sessions</Link>
        </div>

        <div className={styles.navRight}>
          <button
            className={styles.mobileToggle}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {mobileOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>

          <div className={styles.dropdown} ref={dropdownRef}>
            <button
              className={styles.userBtn}
              onClick={() => setShowDropdown(!showDropdown)}
              aria-label="User menu"
            >
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="avatar avatar-sm" />
              ) : (
                <div className="avatar avatar-sm avatar-placeholder">
                  {getInitials(profile?.full_name)}
                </div>
              )}
              <span className={styles.userName}>{profile?.full_name || 'Profile'}</span>
            </button>

            {showDropdown && (
              <div className={styles.dropdownMenu}>
                <Link
                  href="/profile"
                  className={styles.dropdownItem}
                  onClick={() => setShowDropdown(false)}
                >
                  Edit Profile
                </Link>
                <Link
                  href="/my-sessions"
                  className={styles.dropdownItem}
                  onClick={() => setShowDropdown(false)}
                >
                  My Sessions
                </Link>
                <div className={styles.divider} />
                <button
                  className={styles.dropdownItem}
                  onClick={handleSignOut}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={`${styles.mobileMenu} ${mobileOpen ? styles.mobileMenuOpen : ''}`}>
        <Link href="/feed" className={isActive('/feed')}>Feed</Link>
        <Link href="/sessions/new" className={isActive('/sessions/new')}>Create Session</Link>
        <Link href="/my-sessions" className={isActive('/my-sessions')}>My Sessions</Link>
        <Link href="/profile" className={isActive('/profile')}>Profile</Link>
      </div>
    </nav>
  );
}

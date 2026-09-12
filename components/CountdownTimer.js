'use client';

import { useState, useEffect } from 'react';
import { differenceInHours, differenceInMinutes, differenceInSeconds, isPast } from 'date-fns';

export default function CountdownTimer({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState('');
  
  useEffect(() => {
    const date = new Date(targetDate);
    
    if (isPast(date)) {
      setTimeLeft('');
      return;
    }
    
    const updateTimer = () => {
      const now = new Date();
      if (isPast(date)) {
        setTimeLeft('');
        return;
      }
      
      const hours = differenceInHours(date, now);
      const minutes = differenceInMinutes(date, now) % 60;
      const seconds = differenceInSeconds(date, now) % 60;
      
      if (hours > 0) {
        // Just show hours/mins if more than an hour away, it's less jarring
        return; 
      }
      
      setTimeLeft(` • Starts in ${minutes}m ${seconds}s`);
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [targetDate]);
  
  if (!timeLeft) return null;
  
  return (
    <span style={{ color: 'var(--accent)', fontWeight: 500 }}>
      {timeLeft}
    </span>
  );
}

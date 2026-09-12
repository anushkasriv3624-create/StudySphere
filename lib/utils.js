import { formatDistanceToNow, format, differenceInHours, differenceInMinutes, isPast, isToday, isTomorrow } from 'date-fns';

export function getSessionStatus(sessionDate) {
  const date = new Date(sessionDate);
  const now = new Date();

  if (isPast(date)) {
    return { label: 'Past', type: 'past' };
  }

  const hoursAway = differenceInHours(date, now);
  const minutesAway = differenceInMinutes(date, now);

  if (minutesAway <= 30) {
    return { label: 'Happening Now', type: 'live' };
  }

  if (hoursAway < 3) {
    return { label: `In ${minutesAway} min`, type: 'live' };
  }

  if (hoursAway < 24) {
    return { label: `In ${hoursAway}h`, type: 'soon' };
  }

  if (isToday(date)) {
    return { label: 'Today', type: 'soon' };
  }

  if (isTomorrow(date)) {
    return { label: 'Tomorrow', type: 'upcoming' };
  }

  return { label: formatDistanceToNow(date, { addSuffix: true }), type: 'upcoming' };
}

export function formatSessionDate(dateStr) {
  const date = new Date(dateStr);

  if (isToday(date)) {
    return `Today at ${format(date, 'h:mm a')}`;
  }

  if (isTomorrow(date)) {
    return `Tomorrow at ${format(date, 'h:mm a')}`;
  }

  return format(date, "EEE, MMM d 'at' h:mm a");
}

export function formatShortDate(dateStr) {
  return format(new Date(dateStr), 'MMM d, h:mm a');
}

export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getCapacityColor(joined, max) {
  const ratio = joined / max;
  if (ratio >= 1) return 'var(--error)';
  if (ratio >= 0.75) return 'var(--warning)';
  return 'var(--success)';
}

// Sort sessions by urgency: happening soon first, then by date
export function sortByUrgency(sessions) {
  const now = new Date();
  return [...sessions].sort((a, b) => {
    const dateA = new Date(a.session_date);
    const dateB = new Date(b.session_date);
    const isPastA = isPast(dateA);
    const isPastB = isPast(dateB);

    // Past sessions go to the bottom
    if (isPastA && !isPastB) return 1;
    if (!isPastA && isPastB) return -1;
    if (isPastA && isPastB) return dateB - dateA;

    // Future sessions: closest first
    return dateA - dateB;
  });
}

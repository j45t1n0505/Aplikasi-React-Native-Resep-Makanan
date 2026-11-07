/** Formats seconds as a cooking-clock label (mm:ss, or h:mm:ss over an hour). */
export function formatClock(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.ceil(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(
      seconds
    ).padStart(2, '0')}`;
  }

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
    2,
    '0'
  )}`;
}

/** Human-readable duration for meta chips, e.g. "1 j 30 mnt". */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} mnt`;
  }

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} jam` : `${hours} j ${rest} mnt`;
}

/** "1 menit 30 detik" style labels used in the timer presets. */
export function describeSeconds(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  return `${minutes} menit`;
}

export function getGreeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 11) {
    return 'Selamat pagi';
  }
  if (hour < 15) {
    return 'Selamat siang';
  }
  if (hour < 19) {
    return 'Selamat sore';
  }
  return 'Selamat malam';
}

const weekdays = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
];

const months = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export function formatIndonesianDate(date = new Date()): string {
  return `${weekdays[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
}


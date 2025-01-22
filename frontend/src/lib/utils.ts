import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getTimeFromString = (timeStr: string) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.getTime();
};

export const getStatusInfo = (status: string) => {
  switch (status) {
    case 'On time':
      return { color: 'green', text: status };
    case 'Cancelled':
      return { color: 'red', text: status };
    case 'Delayed':
      return { color: 'yellow', text: status };
    default:
      // If it's a specific time
      return { color: 'yellow', text: status };
  }
};

export const addMinutesToTime = (timeStr: string, minutesToAdd: number) => {
  const time = getTimeFromString(timeStr);
  const newTime = new Date(time + minutesToAdd * 60 * 1000);
  return `${String(newTime.getHours()).padStart(2, '0')}:${String(
    newTime.getMinutes()
  ).padStart(2, '0')}`;
};

export const getDelayMinutes = (scheduled: string, estimated: string) => {
  if (
    estimated === 'On time' ||
    estimated === 'Delayed' ||
    estimated === 'Cancelled'
  ) {
    return 0;
  }

  const scheduledTime = getTimeFromString(scheduled);
  const estimatedTime = getTimeFromString(estimated);

  let delayMs = estimatedTime - scheduledTime;

  // If delay appears negative by more than 12 hours, add 24 hours
  if (delayMs < -12 * 60 * 60 * 1000) {
    delayMs += 24 * 60 * 60 * 1000;
  }

  return Math.floor(delayMs / (60 * 1000));
};

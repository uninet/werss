// Date formatting utilities
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

dayjs.locale('zh-cn');

export const formatDate = (date: string | Date | null | undefined, format = 'YYYY-MM-DD HH:mm'): string => {
  if (!date) return '';
  return dayjs(date).format(format);
};

export const formatRelativeTime = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  return dayjs(date).fromNow();
};

export const isRecent = (date: string | Date | null | undefined, hours = 24): boolean => {
  if (!date) return false;
  return dayjs().subtract(hours, 'hour').isBefore(date);
};

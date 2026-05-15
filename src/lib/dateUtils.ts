import { format } from 'date-fns';

export const safeFormat = (date: any, formatStr: string, options?: any) => {
  try {
    if (!date) return '---';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '---';
    return format(d, formatStr, options);
  } catch (error) {
    console.error('Date formatting error:', error, date);
    return '---';
  }
};

export const safeFormatISO = (dateStr: string, formatStr: string, options?: any) => {
  try {
    if (!dateStr) return '---';
    // Append time if only date is provided to avoid timezone shifts
    const d = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`);
    if (isNaN(d.getTime())) return '---';
    return format(d, formatStr, options);
  } catch (error) {
    console.error('ISO Date formatting error:', error, dateStr);
    return '---';
  }
};

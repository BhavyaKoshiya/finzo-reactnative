export const colors = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  background: '#F7F8FC',
  surface: '#FFFFFF',
  text: '#111827',
  secondary: '#64748B',
  success: '#16A34A',
  warning: '#F59E0B',
  error: '#DC2626',
} as const;

export type Colors = typeof colors;

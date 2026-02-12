import { useColorScheme } from './use-color-scheme';

// Define your palette here based on your index.tsx colors
export const Colors = {
  light: {
    text: '#111827',
    background: '#f3f4f6',
    tint: '#00ffd5',
    card: '#ffffff',
    border: '#e5e7eb',
    subText: '#6b7280',
    gradient: ["#f3f4f6", "#e5e7eb"] as const,
  },
  dark: {
    text: '#ffffff',
    background: '#05070f',
    tint: '#00ffd5',
    card: '#111827',
    border: '#1f2937',
    subText: '#9ca3af',
    gradient: ["#0a0f1f", "#05070f"] as const,
  },
};

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'dark'; // Defaulting to dark for Mission Rescue
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
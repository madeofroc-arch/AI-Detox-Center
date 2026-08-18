import { useColorScheme } from 'react-native';
import type { Palette } from './tokens';
import { darkPalette, lightPalette } from './tokens';

export interface Theme {
  colors: Palette;
  isDark: boolean;
}

export function useTheme(): Theme {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return { colors: isDark ? darkPalette : lightPalette, isDark };
}

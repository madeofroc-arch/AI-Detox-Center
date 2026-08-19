import React from 'react';
import { Text } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { type } from '../theme/tokens';

/**
 * A section title inside a screen.
 *
 * It exists so the `header` role is not something each screen has to remember.
 * Screen readers navigate by heading; without the role, "What adds to
 * reliance" and "What lowers it" were ordinary paragraphs, and the only way
 * through the Brain Report was to read every line of it (#4).
 */
export function SectionHeading({ children }: { children: string }) {
  const { colors } = useTheme();
  return (
    <Text accessibilityRole="header" style={[type.heading, { color: colors.ink }]}>
      {children}
    </Text>
  );
}

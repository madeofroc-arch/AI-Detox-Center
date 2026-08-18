import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { radius, spacing, type } from '../theme/tokens';

interface ListItemProps {
  /** Short glyph shown at the leading edge. Never the only carrier of meaning. */
  glyph: string;
  /** Kind in words (pairs with the glyph for color/shape independence). */
  kindLabel: string;
  title: string;
  meta: string;
  onPress?: () => void;
}

/** Design-system list row: 56pt min height, radius md, quiet hierarchy. */
export function ListItem({ glyph, kindLabel, title, meta, onPress }: ListItemProps) {
  const { colors } = useTheme();

  const body = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.lg,
        minHeight: 56,
        borderRadius: radius.md,
        backgroundColor: colors.surfaceAlt,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
      }}
    >
      <Text style={[type.heading, { color: colors.accent }]}>{glyph}</Text>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[type.bodyStrong, { color: colors.ink }]} numberOfLines={2}>
          {title}
        </Text>
        <Text style={[type.caption, { color: colors.inkMuted }]}>
          {kindLabel} · {meta}
        </Text>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${kindLabel}: ${title}, ${meta}`}
        onPress={onPress}
        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
      >
        {body}
      </Pressable>
    );
  }
  return (
    <View accessible accessibilityLabel={`${kindLabel}: ${title}, ${meta}`}>
      {body}
    </View>
  );
}

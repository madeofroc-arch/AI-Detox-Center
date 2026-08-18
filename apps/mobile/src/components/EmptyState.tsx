import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { spacing, type } from '../theme/tokens';
import { Button } from './Button';

interface EmptyStateProps {
  heading: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** An invitation, never a void: short heading + supportive sentence. */
export function EmptyState({ heading, message, actionLabel, onAction }: EmptyStateProps) {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xxl }}>
      <Text style={[type.heading, { color: colors.ink, textAlign: 'center' }]}>{heading}</Text>
      <Text
        style={[
          type.body,
          { color: colors.inkMuted, textAlign: 'center', maxWidth: 320 },
        ]}
      >
        {message}
      </Text>
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} variant="ghost" />
      ) : null}
    </View>
  );
}

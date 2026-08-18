import React from 'react';
import { Redirect } from 'expo-router';
import { useAppStore } from '../state/store';

/** Entry: route to onboarding on first run, otherwise to the tabs. */
export default function Index() {
  const onboardingComplete = useAppStore((s) => s.data.settings.onboardingComplete);
  return <Redirect href={onboardingComplete ? '/(tabs)/home' : '/onboarding'} />;
}

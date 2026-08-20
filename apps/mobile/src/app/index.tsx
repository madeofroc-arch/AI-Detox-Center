import React from 'react';
import { Redirect } from 'expo-router';

/**
 * The front door is the game.
 *
 * It used to be the dependency tracker's onboarding, and for one build after
 * The Adversary existed it still was — the game was reachable only by typing
 * `/adversary`, which meant opening the app showed the abandoned product and
 * nothing anywhere linked to the new one.
 *
 * The tracker's screens are gone — eleven of them, plus the twelve components,
 * the light palette and the i18n sections only they read. `/report`, `/gate`,
 * `/settings` and the rest now 404, which is what "nothing links to them"
 * should have meant in the first place.
 */
export default function Index() {
  return <Redirect href="/adversary" />;
}

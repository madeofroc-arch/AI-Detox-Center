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
 * The tracker's screens are still routable by URL and are not yet deleted; that
 * is a separate change with its own review surface. Nothing links to them.
 */
export default function Index() {
  return <Redirect href="/adversary" />;
}

import React from 'react';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

/**
 * Only the platform edges are mocked, and each one is here for a stated
 * reason. Nothing in `src/` is mocked: a test that stubs the thing it is
 * testing proves the stub works.
 */

// expo-router owns navigation. The tests assert *that* a screen navigates and
// where to, so the router is a spy rather than a real navigator.
export const routerMock = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  dismissTo: vi.fn(),
  navigate: vi.fn(),
};
export const searchParamsMock: { current: Record<string, string> } = { current: {} };

vi.mock('expo-router', () => ({
  router: routerMock,
  useRouter: () => routerMock,
  useLocalSearchParams: () => searchParamsMock.current,
  Redirect: ({ href }: { href: string }) => <div data-testid="redirect" data-href={href} />,
  Link: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  Stack: Object.assign(
    ({ children }: { children?: React.ReactNode }) => <>{children}</>,
    { Screen: () => null },
  ),
  Tabs: Object.assign(
    ({ children }: { children?: React.ReactNode }) => <>{children}</>,
    { Screen: () => null },
  ),
}));

// jsdom has no device locale list, and `getLocales()` throwing is exactly the
// case `deviceLocales()` already guards. Tests that care about language set the
// stored preference instead of pretending to be a phone.
vi.mock('expo-localization', () => ({
  getLocales: () => [{ languageTag: 'en-US' }],
}));

// The real provider needs a native measurement pass that jsdom cannot do.
vi.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  SafeAreaView: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

// AsyncStorage's web build wants a real localStorage; jsdom's is fine, but the
// module resolves to its native entry under this alias set.
const memory = new Map<string, string>();
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: (key: string) => Promise.resolve(memory.get(key) ?? null),
    setItem: (key: string, value: string) => {
      memory.set(key, value);
      return Promise.resolve();
    },
    removeItem: (key: string) => {
      memory.delete(key);
      return Promise.resolve();
    },
  },
}));

afterEach(() => {
  cleanup();
  memory.clear();
  routerMock.push.mockClear();
  routerMock.replace.mockClear();
  routerMock.back.mockClear();
  routerMock.dismissTo.mockClear();
  routerMock.navigate.mockClear();
  searchParamsMock.current = {};
});

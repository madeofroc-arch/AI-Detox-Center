import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'error',
      'no-restricted-globals': [
        'error',
        { name: 'fetch', message: 'No network calls in core (privacy architecture).' },
        { name: 'XMLHttpRequest', message: 'No network calls in core (privacy architecture).' }
      ]
    }
  }
);

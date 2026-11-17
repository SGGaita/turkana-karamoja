// ESLint for the website (FE-05): Next.js's recommended rules plus Core Web Vitals.
// `npm run lint`; CI runs it on every push and pull request.
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

const config = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'public/**',
      'playwright-report/**',
      'test-results/**',
      'reports/**',
      'coverage/**',
    ],
  },
  ...compat.extends('next/core-web-vitals'),
];

export default config;

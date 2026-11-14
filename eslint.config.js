import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'node_modules'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: { ecmaVersion: 2022, globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  // Layering: dependencies point inward. core <- shared <- games/app.
  {
    files: ['src/core/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^@/(app|play|landing|games|shared)(/|$)',
              message: 'src/core is the innermost layer and must not import from outer layers.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^@/(app|play|landing|games)(/|$)',
              message: 'src/shared must not depend on the app layer or on games.',
            },
          ],
        },
      ],
    },
  },
  // Game modules must stay independent: a game may use src/core and src/shared,
  // but never reach into another game's folder. A relative import that climbs
  // out of the game's own folder (e.g. '../rolling-dice') is blocked, as is '@/games/...'.
  ...[1, 2, 3, 4].map((depth) => ({
    files: [`src/games/*/${'*/'.repeat(depth - 1)}*.{ts,tsx}`],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: `^(\\.\\./){${depth}}|^@/games/`,
              message:
                'Games must not import from other games. Move shared code to src/core or src/shared.',
            },
          ],
        },
      ],
    },
  })),
  // A game's index.ts is loaded for every visitor (it's how games are
  // discovered), so it must stay metadata-only. Importing the game's own files
  // normally would pull the whole game into the main bundle. Use
  // `load: () => import('./MyGame')` instead. Type-only imports are fine.
  {
    files: ['src/games/*/index.ts'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^\\.{1,2}/',
              allowTypeImports: true,
              message:
                "A game's index.ts must stay metadata-only. Load the game lazily with load: () => import('./MyGame').",
            },
          ],
        },
      ],
    },
  },
);

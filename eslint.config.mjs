import { defineConfig } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import tseslint from 'typescript-eslint';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Two of this project's stated conventions are enforced here as real
 * lint errors, not just documentation someone has to remember:
 *
 *  - Zero `z.infer<...>` anywhere. Every type the app consumes is a
 *    hand-written interface, kept next to (never derived from) any Zod
 *    schema used for runtime validation. The `no-restricted-syntax`
 *    selector below targets the exact AST shape of `z.infer<typeof X>`
 *    (a qualified-name type reference `z.infer`) and fails the build if
 *    it ever appears.
 *  - Zero hardcoded hex/rgb color values in `className` strings
 *    (Tailwind's arbitrary-value syntax, e.g. `bg-[#ff6600]`). Every
 *    color must resolve through a design token defined once in
 *    globals.css's `@theme` block — see that file's header comment.
 *
 * Both are deliberately narrow, targeted selectors rather than a broad
 * regex ban — narrow enough to avoid false positives on unrelated code,
 * specific enough to catch the exact two patterns this project forbids.
 *
 * `eslint-config-next/core-web-vitals` + `/typescript` are imported
 * directly here, NOT via the `FlatCompat`/`@eslint/eslintrc` bridge an
 * earlier version of this file used. Re-verified against a real
 * `npm install` this session: `eslint-config-next@16.2.10` now ships
 * native flat-config exports, and running it through `FlatCompat`'s
 * legacy-config validator instead crashes with a
 * "Converting circular structure to JSON" error (a real incompatibility
 * between that bridge and this version's plugin graph, not a config
 * mistake — confirmed against Next.js's own current ESLint docs, which
 * show this exact native-import pattern as the supported setup for
 * Next 16). The `@eslint/eslintrc` dependency this used to require has
 * been dropped from package.json accordingly.
 *
 * The outer wrapper is ESLint core's own `defineConfig()`, not
 * `tseslint.config()` — re-verified the same session: `typescript-eslint`
 * now marks its own `config()` helper deprecated in favor of this one.
 * `defineConfig()` still flattens nested arrays (like
 * `tseslint.configs.strictTypeChecked` below) the same way.
 */
export default defineConfig(
  {
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts', 'coverage/**'],
  },
  ...nextVitals,
  ...nextTypescript,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          // eslint.config.mjs and postcss.config.mjs are real .mjs files,
          // deliberately outside tsconfig.json's `include` (allowJs is
          // false — see tsconfig.json). Without this, the type-aware
          // parser refuses to parse them at all ("not found by the
          // project service"). This gives just these two a lightweight
          // default project instead of failing outright.
          allowDefaultProject: ['*.config.mjs'],
        },
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      // Deliberately off, not 'warn': the actual project requirement is
      // that every function's PARAMETERS are typed (enforced by `strict`
      // + this file's other rules), not that every React component
      // additionally carries an explicit JSX return-type annotation —
      // that's non-idiomatic friction for this ecosystem, not a real
      // safety improvement. Left at 'warn' here would have failed lint
      // on nearly every component file, since package.json's lint
      // script uses --max-warnings=0.
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-non-null-assertion': 'warn',

      'no-restricted-syntax': [
        'error',
        {
          selector: "TSTypeReference[typeName.left.name='z'][typeName.right.name='infer']",
          message:
            'This project never uses z.infer<>. Write an explicit, hand-authored interface next to the Zod schema instead — see README.md "Type conventions".',
        },
        {
          selector: 'Literal[value=/\\[#[0-9a-fA-F]{3,8}\\]/]',
          message:
            "No hardcoded hex colors in className (Tailwind arbitrary-value syntax). Add or use a design token in globals.css's @theme block instead.",
        },
      ],

      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    // Config files and test setup run under Node, not the browser/React
    // runtime the rest of the app targets, and reasonably need
    // console output (a build-time warning, a test-setup log).
    files: ['*.config.{js,mjs,ts}', 'vitest.setup.ts'],
    rules: {
      'no-console': 'off',
    },
  },
);

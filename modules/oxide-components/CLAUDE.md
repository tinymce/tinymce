# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`@tinymce/oxide-components` is a React component library for TinyMCE. Components integrate with TinyMCE's Oxide design system and are documented with Storybook.

Part of the TinyMCE monorepo at `/modules/oxide-components`.

## Common Commands

```bash
# Development
yarn start            # Storybook dev server (port 6006)

# Build
yarn build            # Full production build (Storybook + library)

# Linting
yarn lint             # ESLint (zero warnings enforced)

# Testing
yarn test-watch                  # All tests in watch mode
yarn test-browser-headless       # Browser tests (headless)
yarn test-browser-manual         # Browser tests (visible browser)
yarn test-visual-local           # Visual regression tests
yarn test-visual-local-update    # Update visual regression baselines
yarn test-ci                     # CI test suite with JUnit output
```

## Test Structure

Two Vitest projects configured in `vitest.config.ts`:
- **atomic**: Node.js environment (`src/test/ts/atomic/**/*.spec.ts`)
- **browser**: Playwright-based (`src/test/ts/browser/**/*.spec.{ts,tsx}`)

Visual regression tests use Playwright directly via `src/test/ts/visual.spec.ts` and `playwright.config.ts`.

## Architecture

### Source Layout
- `src/main/ts/components/` - Shared components (each has `Component.tsx` and `Component.stories.tsx`)
- `src/main/ts/keynav/` - Keyboard navigation system with hooks interface
- `src/main/ts/utils/` - Utilities (`Styles.ts` for CSS classes, `FocusHelpers.ts`)
- `src/main/ts/main.ts` - Library exports
- `src/demo/ts/App.tsx` - Scratch area for testing components during development

### Key Patterns

**CSS Classes**: Use the type-safe BEM helpers from `utils/Bem.ts` (for UI skin classes) and `utils/ContentUiBem.ts` (for content UI classes). These validate class names against the Oxide skin at compile time.
- `Bem.block('tox-button', { active: true })` → `'tox-button tox-button--active'`
- `Bem.element('tox-form', 'group', { error: true })` → `'tox-form__group tox-form__group--error'`

**Storybook**: Every component needs a `.stories.tsx` file. Visual regression tests auto-generate from stories; use `skip-visual-regression` tag to opt out.

**Keyboard Navigation**: The `keynav/` system provides multiple navigation patterns (flow, tabbing, special). Check `KeyboardNavigationHooks.ts` for the React hooks API.

### CSS Migration (LESS → CSS Custom Properties)

Components are migrating from LESS to CSS Custom Properties. During transition:
- Guard CSS Custom Properties with `@custom-properties-enabled` flag
- Prefix new variables with `--tox-private-`
- Always provide LESS fallbacks: `var(--tox-private-value, @less-variable)`

See `TRANSITIONALCSS.md` for full migration guide.

## Dependencies

- `@ephox/katamari` - Functional utilities
- `@ephox/sugar` - DOM utilities
- React 18.3.1+ (peer dependency)

## Code Review Instructions

@coderabbitai: When reviewing PRs, if you see the `skip-visual-regression` tag being used in any story file, always warn the user and ask whether skipping visual regression testing is intentional.

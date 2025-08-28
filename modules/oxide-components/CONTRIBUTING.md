# Contributing to Oxide Components

`oxide-components` is a React component library for the TinyMCE rich text editor. This guide will help you understand the project structure, architecture, and development workflow.

## Project Overview

This library provides reusable React components that integrate with TinyMCE's Oxide design system. Components are built with TypeScript, documented with Storybook, and thoroughly tested with both unit and visual regression tests.

## Folder Structure

### Root Directory
- `package.json` - Dependencies, scripts, and project metadata
- `tsconfig.json` - Main TypeScript configuration (references other configs)
- `vite.config.ts` - Build configuration for the library
- `vitest.config.ts` - Test configuration for unit and browser tests
- `playwright.config.ts` - Visual regression test configuration
- `eslint.config.ts` - Linting rules and configuration

### Source Code (`src/`)

#### Main Library (`src/main/ts/`)
The core library code organized by functionality:

**Components (`components/`)**
- contains shared components that can be used across different projects.

**Internal Components (`internal/`)**
- contains internal components that are used by other components.

**Keyboard Navigation (`keynav/`)**
- `KeyboardNavigationHooks.ts` - Main file that exports hooks for keyboard navigation
- `keyboard/` - Core keyboard navigation logic
  - `xxxtype/` (e.g: like `flowtype`): Folder that contains code for said type of navigation
    - `XxxType.ts` (e.g: `FlowType.ts`): Main file containing logic for said type navigation
    - `XxxType.stories.tsx` (e.g: `FlowType.stories.tsx`): Storybook stories for said type navigation
    - `stories/`: Folder that contains stories and code needed only for stories for said type navigation. The stories in this folder would be exported and then imported in the main `XxxType.stories.tsx` file.
- `navigation/` - Navigation utilities and algorithms

**Utilities (`utils/`)**

Contains some global utilities used in the project.
- `Styles.ts` - CSS class name utilities
- `FocusHelpers.ts` - Focus management utilities

**Main Export (`main.ts`)**
- Central export file for the entire library

#### Demo Application (`src/demo/`)

If needed, the developer can use this folder to test and develop the component he/she is working on, until it is ready to have a proper story that can be used to showcase the component's functionality and behavior.
- `html/index.html` - Demo app HTML template
- `ts/main.tsx` - Demo app entry point (Shouldn't be changed directly)
- `ts/App.tsx` - Demo application component: Main file the developer can use to test and develop the component he/she is working on.

#### Tests (`src/test/`)
- `ts/browser/` - Browser-based tests
  - `components/` - Component tests
  - `keynav/` - Keyboard navigation hooks tests
- `ts/visual.spec.ts` - Visual regression tests using Playwright

### Configuration Files

#### Storybook (`.storybook/`)
- `main.ts` - Storybook configuration and addons
- `preview.tsx` - Global decorators and parameters
- `vitest.setup.ts` - Vitest integration setup

#### TypeScript Configurations
- `tsconfig.app.json`: Main library build configuration. Used to build the library.
- `tsconfig.demo.json`: Demo application configuration. Used when starting the dev server that serves the demo application in `src/demo/`.
- `tsconfig.node.json`: Node.js tools configuration. Used to get type checking and linting for Node.js scripts and config files such as `vite.config.ts` and `playwright.config.ts`.
- `tsconfig.test.json`: Test files configuration. Used for type checking and building test files by `vitest`.

## Architecture

### Component Architecture

Components follow a consistent pattern:

1. **Component File** (`Component.tsx`)
   - Main component implementation
   - TypeScript interfaces for props
   - Styled with Oxide CSS classes

2. **Stories File** (`.stories.tsx`)
   - Storybook documentation and examples
   - Interactive demos with different states
   - Accessibility testing integration
   - If the story file becomes too large, consider splitting it into multiple files. You can use the `main/ts/keynav/keyboard/flowtype/` as a reference for organizing your stories.

3. **Utilities** (`ComponentUtils.ts` where needed)
   - Component-specific helper functions
   - Complex logic separated from UI code

### Keyboard Navigation System

The library includes a sophisticated keyboard navigation system:

- **Hooks Layer**: React hooks that bind keyboard events to components
- **Keying Types**: Different navigation patterns (flow, tabbing, special, ...etc)
- **Navigation Logic**: Core algorithms for moving focus between elements
- **Key Handling**: Event processing and key combination matching

### Styling Integration

Components integrate with TinyMCE's Oxide design system:
- Developers should not pass CSS classes directly, they should instead use the `classes` utility function to combine class names.

### Testing Strategy

1. **Atomic Tests**: These tests do not exist yet. We will configure them using vitest running in nodejs when needed.
2. **Browser Tests**: Real browser interaction testing with vitest and Playwright under the hood.
3. **Visual Regression**: Done directly using Playwright. The tests exist in the `src/test/ts/visual.spec.ts` file. The playwright configuration is in `playwright.config.ts`.

## Development Workflow

### Getting Started

1. Install dependencies:
   ```bash
   yarn install
   ```

2. Start development server:
   ```bash
   yarn dev
   ```

3. Start Storybook:
   ```bash
   yarn start
   ```

### Available Scripts

- `yarn dev` - Start Vite development server
- `yarn build` - Build library and Storybook
- `yarn start` - Start Storybook development server
- `yarn lint` - Run ESLint
- `yarn test-watch` - Run all tests in watch mode
- `yarn test-browser-headless` - Run browser tests in headless mode
- `yarn test-browser-manual` - Run browser tests in a browser
- `yarn test-visual-local` - Run visual regression tests
- `yarn test-visual-local-update` - Updates screenshots for visual regression tests

### Creating New Components

1. Create component directory in `src/main/ts/components/`
2. Add component file with the name `Component.tsx`
3. Create Storybook stories with `.stories.tsx` extension
4. Add tests in `src/test/ts/browser/components/`
5. Export from `src/main/ts/main.ts`

### Component Guidelines

- Use TypeScript interfaces for props
- Extend appropriate HTML element attributes when applicable
- Always apply Oxide CSS classes using the `classes` utility
- Include comprehensive Storybook documentation
- Add keyboard navigation where appropriate
- Follow accessibility best practices

### Testing Guidelines

- Write browser tests for complex interactions
- Visual regression tests are included in all stories by default. When visual regression tests are not needed, use the `skip-visual-regression` tag in the main story configuration.
- Use Storybook for documentation and manual testing

### Code Style

- Use descriptive variable and function names
- Include JSDoc comments for public APIs

## Dependencies

### Core Dependencies
- `@ephox/katamari` - Functional programming utilities
- `@ephox/sugar` - DOM manipulation utilities

### Peer Dependencies
- `react` ^18.3.1
- `react-dom` ^18.3.1

### Development Dependencies
- Storybook ecosystem for documentation
- Vitest for testing
- Playwright for browser testing
- ESLint for linting
- TypeScript for type safety


## Getting Help

- Check existing Storybook documentation
- Look at similar components for patterns
- Review test files for usage examples

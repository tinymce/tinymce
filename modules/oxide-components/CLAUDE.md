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
- Type safety is enforced on the **inputs** (block/element/modifier arguments), not the return value — all Bem functions return plain `string`. You cannot use Bem output to type-restrict a prop to valid Oxide classes.

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

## Component Patterns

### Dropdown
`Dropdown.Root` > `Dropdown.Trigger` > element, `Dropdown.Content` > children

- `Dropdown.Root` props: `side` ('top'|'bottom'|'left'|'right', default `'bottom'`), `align` ('start'|'center'|'end', default `'start'`), `gap` (px, default `1`), `triggerEvents` (default `['click']`)
- `Dropdown.Trigger` clones its single child element and injects click-to-toggle and ref
- `Dropdown.Content` props include `onOpenChange?: (isOpen: boolean) => void`; renders children only when open (children mount/unmount each time)
- Positioning uses CSS anchor positioning — no manual position calculation needed
- Escape key and focus-return-to-trigger are handled automatically
- **`className` prop is merged** with the internal `tox-dropdown-content` class — just pass the additional class(es) and `tox-dropdown-content` is always included
- **`style` prop is merged** with internal positioning styles (`propStyle` first, then `insetProps`/`positionArea`), so internal styles win on conflict. Use this to pass constraints like `maxHeight`.
- **Popover elements stay in their original DOM tree position** even though they render in the top layer visually. `UiFinder.findIn(sidebarElement, selector)` will still find a `Dropdown.Content` that was rendered inside that sidebar.
- **Double shadow**: `tox-dropdown-content` and `tox-menu` both define `box-shadow` by default. `dropdown.less` suppresses `tox-menu`'s shadow when inside a dropdown (`box-shadow: none`) so there is only one. Do not add `box-shadow` to a custom `tox-dropdown-content` subclass expecting it to be the only shadow — the menu's is already suppressed.
- **Constraining dropdown height with scrolling**: Pass `maxHeight` as an inline `style` prop to `Dropdown.Content`. The default `overflow: auto` on `tox-dropdown-content` will clip and scroll the content. However, to make the inner `tox-menu` scroll instead (so its background covers the full visible area), set `max-height: inherit` and `overflow: auto` on the inner `.tox-menu` — this prevents background bleed during macOS rubber-band overscroll at the edges.
- **Customising a dropdown's visual appearance**: To move a custom shadow to the inner `tox-menu` (e.g. to avoid clipping it with `overflow`), make the outer `tox-dropdown-content` a transparent wrapper: `background-color: transparent; box-shadow: none; overflow: visible`. Then on the inner `.tox-menu`: set the custom `box-shadow`, `max-height: inherit`, and `overflow: auto`. Note: this pattern is only needed when a custom shadow differs from the default — for standard appearance, use the simpler `max-height`/`overflow` approach above.

### Menu
`Menu.Root` > `Menu.Item` | `Menu.ToggleItem` | `Menu.SubmenuItem`

- `Menu.Root` sets up `useFlowKeyNavigation` and focuses the first enabled item on mount
- `Menu.ToggleItem` props: `active` (boolean, syncs reactively from prop), `onAction: (api) => void`, `icon?`, `enabled?` (default `true`), `shortcut?`
- `Menu.ToggleItem` renders `children` inside the item-label div — rich content (e.g. multi-line descriptions) is supported
- The checkmark icon is always rendered by `Menu.ToggleItem`; do not add a separate one
- `Menu.ToggleItem` renders with `role="menuitemcheckbox"` — use this as a test selector when `tox-collection__item` is too generic
- See `Menu.stories.tsx` → `MenuInADropdown` story for the canonical Dropdown + Menu composition

### Composing Tooltip + Dropdown on the same trigger
Both `Tooltip.Trigger` and `Dropdown.Trigger` use `cloneElement` to inject event handlers into their child. They can be nested as `Tooltip.Trigger` > `Dropdown.Trigger` > button element:

```tsx
<Dropdown.Root>
  <Tooltip.Root>
    <Tooltip.Trigger>
      <Dropdown.Trigger>
        <Button active={isOpen} ... />
      </Dropdown.Trigger>
    </Tooltip.Trigger>
    <Tooltip.Content text={tooltipText} />
  </Tooltip.Root>
  <Dropdown.Content onOpenChange={setIsOpen}>
    <Menu.Root>...</Menu.Root>
  </Dropdown.Content>
</Dropdown.Root>
```

This works because `Dropdown.Trigger` spreads `...props` onto the button child, forwarding the mouse/focus event handlers that `Tooltip.Trigger` injected. Both components' internal refs end up pointing to the button DOM element via the ref-forwarding chain.

`Dropdown.Root`'s context is accessible to `Dropdown.Trigger` even when it is nested inside other components (like `Tooltip.Root`) — React context traverses the tree regardless of intermediate components.

### IconButton
- Renders a single icon inside a `Button` with the `tox-button--icon` class
- Props: `icon` (required) + all `ButtonProps` except `children` (forbidden) and `className` (forbidden)
- Use `Button` instead when the button needs text content alongside an icon

## Testing Dropdown Components

`Dropdown.Content` does not set `aria-hidden`. Since children are only rendered when open, use child presence to assert open/closed state in bedrock tests:

```ts
// Wait for open — throws until children are mounted
() => UiFinder.findIn(menuElement, Bem.elementSelector('tox-collection', 'item')).getOrDie()

// Wait for closed — throws while children are still present
() => UiFinder.notExists(menuElement, Bem.elementSelector('tox-collection', 'item'))
```

When selecting menu items by position in tests, scope to the menu element to avoid matching `tox-collection__item` elsewhere in the UI, and prefer `[role="menuitemcheckbox"]` over the BEM class for specificity:
```ts
`${Bem.elementSelector('tox-ai', 'models-menu')} [role="menuitemcheckbox"]:first-child`
```

## Code Review Instructions

@coderabbitai: When reviewing PRs, if you see the `skip-visual-regression` tag being used in any story file, always warn the user and ask whether skipping visual regression testing is intentional.

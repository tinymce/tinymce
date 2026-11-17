# CSS Properties (internal) addon

A Storybook panel for exploring and overriding the oxide skin's CSS custom properties
(private `--tox-private-*` and public) live, on the component stories.

## Running it

```bash
# 1. Build oxide: writes build/custom-properties/ (manifest, types, flag-on CSS)
cd editor/modules/oxide && bun run build
# 2. Start Storybook
cd editor/modules/oxide-components && bun run start
```

While iterating on LESS, run `bun run watch-custom-properties` in `editor/modules/oxide`.
It regenerates the manifest and flag-on CSS on every change, and Storybook hot-reloads them.

## Using it

- The toolbar switches the skin, and between the build with custom properties on and the
  plain LESS build.
- The panel lists the global properties, then those of every component group the story
  has rendered. Rows show the skin's value in an editable input and the value it resolves
  to on the page.
- Overrides apply to every story until reset. Copy CSS to share them; Import takes the
  same CSS back (or any CSS rules declaring the skin's properties) and merges it in.

Groups that only render after an interaction, such as a menu behind a trigger, are listed
once they appear. To list them from the start, declare them on the story file's default
export:

```ts
import type { CustomPropertyGroup } from 'oxide-components/utils/CustomProperties';

parameters: {
  cssProperties: { groups: [ 'menu' ] satisfies CustomPropertyGroup[] }
}
```

## What's where

| File | Runs in | Purpose |
| --- | --- | --- |
| `preset.ts` | Storybook | Registers the manager and preview entries below |
| `preview.ts`, `Runtime.ts` | Preview iframe | Toolbar, override injection, reporting what the story renders |
| `manager.ts`, `Panel.tsx` | Manager | The panel |
| `Shared.ts` | Both | Events, types, override CSS generation |

Overrides are written as `!important` redeclarations on every selector the skin declares
the property on, so component-level declarations are overridden too.

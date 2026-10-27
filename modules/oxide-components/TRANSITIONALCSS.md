# Converting a Legacy Component to the Transitional Stage

This guide outlines the steps required to migrate a **Legacy** Oxide component (styled entirely with LESS) into the **Transitional** stage, where modern CSS features are introduced alongside existing LESS code under a feature flag. This incremental migration ensures backward compatibility while laying the foundation for future **Modern CSS** components.


## Global setup

Before converting individual components, several global configurations must be in place:

1. The `@custom-properties-enabled`  feature flag was introduced in [feature-flags.less](https://github.com/tinymce/tinymce/blob/main/modules/oxide/src/less/theme/globals/feature-flags.less).
2. A set of global CSS Custom Properties was created in [global-custom-properties.less](https://github.com/tinymce/tinymce/blob/main/modules/oxide/src/less/theme/globals/global-custom-properties.less).


## Skins and the feature flag

**Flag disabled** (`@custom-properties-enabled: false`, the default) is what customers use today. Every skin built on Oxide's LESS variables must keep working exactly as before:

- the Oxide skins in `editor/modules/oxide/src/less/skins/ui` (`default`, `dark`, `tinymce-5`, `tinymce-5-dark`),
- the premium skins in `ui/oxide-premium-skins` (`bootstrap`, `fluent`, `material-classic`, …), which import the `tinymce-5` skin and override LESS variables on top of it,
- integrators' own skins, which may override any LESS variable with any valid value, including a unitless `0`.

**Flag enabled**: skins will be built with CSS Custom Properties. Which properties will form the public skinning API is not decided yet, so for now every Custom Property is `--tox-private-*`, and the `tinymce-5` and premium skins' LESS overrides don't have to be reproduced as Custom Properties.

This leads to two rules for every conversion:

- **LESS variables are public API.** Never remove, rename or redefine a LESS variable, and keep every `var()` fallback driven by the LESS variables the declaration used before.
- **Declarations may change, results may not.** The compiled CSS doesn't have to stay identical, but with the flag off it must compute the same values as before in every skin, and with the flag on it must compute the same values as with the flag off.


## Step-by-Step: Converting to the Transitional Stage

Here are the steps you need to take to convert a legacy component to a transitional one:

    
1. **Guard CSS Custom Properties with the Feature Flag**\
Use the `@custom-properties-enabled` flag to define Custom Properties only when enabled.  Example:

    ```less
    .tox-button when (@custom-properties-enabled = true) {
      --tox-private-btn-padding: 4px;
    }
    ```

2. **Prefix New CSS Custom Properties with `tox-private`**\
Use the `tox-private` prefix for all new CSS Custom Properties.
    
    > Why?
    This clearly signals internal, non-public usage. These variables can safely change during the migration process without affecting customers. We must retain the flexibility to revisit and adjust CSS Custom Properties without risking breaking changes for customers. Later, CSS Custom Properties will form a skinning API and we will remove the `private` prefix.
    > 
    
3. **Use Custom Properties with Fallbacks**\
Always provide a fallback to the existing LESS variable for backward compatibility. You can also fallback to a fixed value. **Remember, CSS Custom Properties will not be defined when the feature flag is disabled so they always need a fallback value.**
    
    ```less
    .tox-button {
      padding: var(--tox-private-btn-padding, @btn-padding); // fallback to a component LESS variable
      border-radius: var(--tox-private-btn-border-radius, @control-border-radius); // fallback to a global LESS variable
      height: var(--tox-private-control-height, 36px); // fallback to a fixed value
    }
    ```

    **Fall back to the same LESS variable the declaration used before, including composite ones.** If a rule was `padding: @dialog-header-padding`, declare a Custom Property for the whole value and keep the composite variable as the fallback:

    ```less
    .tox-dialog when (@custom-properties-enabled = true) {
      --tox-private-dialog-header-padding: var(--tox-private-pad-sm) var(--tox-private-pad-md) 0 var(--tox-private-pad-md);
    }

    .tox-dialog__header {
      padding: var(--tox-private-dialog-header-padding, @dialog-header-padding); // ✅
      // padding: var(--tox-private-pad-sm, @pad-sm) var(--tox-private-pad-md, @pad-md) 0 var(--tox-private-pad-md, @pad-md); ❌ ignores skins that override @dialog-header-padding
    }
    ```

    **Never use a CSS-wide keyword (`initial`, `inherit`, `unset`, `revert`) as a Custom Property value.** `--x: initial` makes the property invalid, so every `var(--x, …)` silently uses its fallback. Use the computed equivalent instead, e.g. `none` for `text-transform: initial`.

4. **Keep Calculations Valid for Every Skin**\
A unitless `0` is a valid length on its own, but not inside `calc()`: `calc(0 + 1px)` and `calc(36px - 0 * 2)` are invalid, and the browser drops the whole declaration. The `tinymce-5` skin sets several LESS variables to `0`, and integrators can too. So when LESS math on a **length** moves into CSS, give the computed value its own Custom Property and keep the original LESS expression as the whole fallback. LESS evaluates math and functions inside a `var()` fallback, so the flag-off output stays a plain value:

    ```less
    .tox-toolbar when (@custom-properties-enabled = true) {
      --tox-private-toolbar-separator-margin-top: calc(var(--tox-private-toolbar-separator-distance) - 1px);
    }

    .tox-toolbar {
      margin-top: var(--tox-private-toolbar-separator-margin-top, @toolbar-separator-distance - 1px); // ✅ LESS outputs -1px
      // margin-top: calc(var(--tox-private-toolbar-separator-distance, @toolbar-separator-distance) - 1px); ❌ calc(0 - 1px) when the variable is 0
    }
    ```

    Values that always carry a unit, such as times, are safe to calculate inline: `calc(var(--tox-private-pop-transition-time, @pop-transition-time) / 2)`.

5. **Declare Custom Properties on the Component Root**\
Declare a component's Custom Properties on its root element, so every element inside the component inherits them. Check the real markup in the TypeScript (or the plugin's source), not just the class names:
    - a component can be rendered in more than one place (`.tox-mbtn` is used in the menubar, but also in the Tree dialog);
    - a block can sit inside another block (`.tox-comment-thread` is inside `.tox-comment`, `.tox-comment__date` is inside `.tox-user`);
    - when a component's root elements don't share a class, list them all: `.tox-tbtn, .tox-split-button, .tox-number-input { … }`.

    Custom Properties that reference other Custom Properties are resolved on each element. A more specific rule on the same element can override an input (e.g. an offset), and every Custom Property derived from it is recomputed there.


6. **Use Global Custom Properties Where Needed**\
Prefer using a **global** CSS Custom Property instead of duplicating it locally. Component CSS Custom Properties should be created intentionally - when we want to introduce new API for skinning particular component style.\
You can reference a global variable directly, but remember to also include a fallback. Note, global CSS Custom Properties also come with the `tox-private` prefix for now:
    
    ```less
    color: var(--tox-private-text-color, @text-color);
    ```

    Name component Custom Properties `--tox-private-<component>-[<state>-]<property>`, after the component's class.

7. **Promote Shared Variables to Global Scope**\
If a LESS variable is reused across multiple components, its corresponding CSS Custom Property should be made global. Component variables should not be cross-referenced in other components: that hides the fact that changing one value changes several components.
    - Name a global after the role it plays, not after one of the components using it (`--tox-private-bar-item-height` is shared by toolbar and menubar buttons), and make sure it can't be confused with an existing component (e.g. `.tox-button`).
    - Add a comment listing who uses it, so it's clear what changing it affects.
    - Don't create a global for a value that is only coincidentally shared, or that means nothing on its own (`0`, `none`). Let each component declare its own.
    - LESS comments can be out of date (e.g. claiming two components share a value). Compare the actual values before promoting anything.

8. **Convert Fixed-Value LESS Variables and Keep State Chains**\
LESS variables holding fixed values (`border: 0`, `box-shadow: none`, `transform: none`, `font-style: normal`, sizes) get component Custom Properties too. Some are documented skinning hooks (e.g. "set to `translateY(1px)` for a small push down effect"), and they would be lost when LESS is removed. Plain CSS values that were never LESS variables (`padding: 4px 12px`) stay as they are.

    When LESS derives states from each other, mirror the chain, as `button-secondary.less` does: overriding the base value then changes every state, and each state can still be overridden on its own.

    ```less
    --tox-private-toolbar-button-border: 0;
    --tox-private-toolbar-button-hover-border: var(--tox-private-toolbar-button-border);
    --tox-private-toolbar-button-focus-border: var(--tox-private-toolbar-button-hover-border);
    ```

    
9. **CSS Color Calculations (Relative Colors)**\
    Here’s how to translate LESS color adjustments into modern CSS:
    
    **LESS**
    
    ```less
    darken(@bg, 6%);
    lighten(@bg, 14%);
    ```
    
    **CSS Equivalent**
    
    ```css
    hsl(from var(--tox-private-bg) h s calc(l - 6));
    hsl(from var(--tox-private-bg) h s calc(l + 14));
    ```
    
    **Explanation**
    
    - We're using the `hsl()` function because it allows direct manipulation of the **lightness** channel.
    - The `from` keyword tells the browser to extract color channels from the input color (it can be represented as a hexadecimal value, rgb, hex or any other valid CSS color declaration).
    - You then explicitly define each channel (hue, saturation, lightness), adjusting only what you need

10. **Replace Theme-Based LESS Logic**\
When creating CSS Custom Properties avoid using LESS functions like `contrast()` or `.bg-luma-checker`. Instead, use:
    - The `light-dark()` function
    - Relative color syntax in `hsl()` or other color models
    
    Example: 
    
    ```less
    .tox-button when (@custom-properties-enabled = true) {
      // simple light-dark function usage:
      --tox-private-btn-bg: light-dark(#fff, #000);

      // using relative colors syntax inside light dark function:
      --tox-private-btn-bg: light-dark(
        hsl(from var(--tox-private-bg) h s calc(l + 14)),
        hsl(from var(--tox-private-bg) h s calc(l - 6))
      );
    }
    ``` 

    > **Avoid mixing LESS logic inside CSS Custom Property declarations. Keeping them purely in CSS will simplify the path to Modern CSS stage.**
    > 

    Keep everything in the component file. Don't override Custom Properties in skin files (e.g. `skins/ui/dark/skin.less`): it splits the component across files and breaks `--tox-private-color-scheme: light dark`, where one skin follows the system theme.

    `light-dark()` only accepts colors, so it can't switch a whole value such as `box-shadow: none`. Switch the colors instead. A shadow whose colors are all transparent paints nothing, and `css-parity` treats it as `none`:

    ```less
    // The dark skin has no menu shadow
    --tox-private-menu-box-shadow:
      0 0 2px 0 light-dark(hsl(from var(--tox-private-color-black) h s l / 20%), transparent),
      0 4px 8px 0 light-dark(hsl(from var(--tox-private-color-black) h s l / 15%), transparent);
    ```

    CSS has no equivalent of LESS's `contrast()` against an arbitrary color yet (e.g. picking black or white text for a thumb colored with the tint). Use the value LESS resolves to, and add a comment saying why.

    <details>
    <summary><strong>How does <code>light-dark()</code> function work?</strong></summary>
    <p>The <code>light-dark()</code> function automatically responds to the end user’s system theme (light or dark mode). This removes the need for maintaining separate light and dark skins.<br/>
    However, not all integrators may want the editor to adjust dynamically based on the system settings. Some applications may only support a single theme regardless of the user’s device preferences.
    To support this flexibility, we introduced global CSS Custom Property to control theme behavior:
    </p>
    <table>
        <tr>
        <td><code>--tox-private-color-scheme: light</code></td>
        <td>
          <ul>
            <li>Forces the editor to use light mode colors only.</li>
            <li>This is equivalent to the current default mode.</li>
          </ul>
        </td>
        </tr>
        <tr>
          <td><code>--tox-private-color-scheme: dark</code></td>
        <td>
          <ul>
            <li>Forces the editor to use dark mode colors only.</li>
            <li>This is equivalent to the current dark mode.</li>
          </ul>
        </td>
        </tr>
        <tr>
          <td><code>--tox-private-color-scheme: light dark</code></td>
        <td>
          <ul>
            <li>Enables the editor to dynamically adapt to the end user's system theme using the light-dark() function.</li>
            <li>This is the most modern, system-integrated approach.</li>
          </ul>
        </td>
        </tr>
    </table>
    </details>
    <br/>

11. **Verify Parity with the `css-parity` Tool**\
Once a component's rules are converted, confirm the custom-properties (flag on) output resolves to the same computed values as the LESS (flag off) output. Run it from `editor/modules/oxide/` — there's nothing to register:

    ```bash
    bun run css-parity
    ```

    It compiles the `default` and `dark` skins twice each (flag off/on), renders a DOM for every selector in the skin into headless Chromium — one page per compile per emulated media scenario — and compares the computed values. `:hover`/`:active`/`:focus`/`:focus-within`/`:focus-visible`/`:visited` are forced through the DevTools protocol, `:has()`, `:checked`, `:disabled` and structural pseudo-classes are synthesized, and rules inside `@media` are evaluated under emulated narrow-viewport and forced-colors conditions. The DOM follows BEM: an element class (`.tox-dialog__header`) is placed inside its block (`.tox-dialog`), and a modifier class (`.tox-checkbox--disabled`) also gets its base class (`.tox-checkbox`), so Custom Properties declared on a component's root reach the rules that read them. Markup that nests one block inside another (e.g. `.tox-comment-thread` inside `.tox-comment`) can't be inferred from BEM names; list it in `KNOWN_ANCESTORS` in `tools/css-parity/css-rules.ts`. Only the custom properties build declares a `color-scheme` (`light-dark()` needs it), so the LESS page is given the same one — otherwise every system color, scrollbar and native control would differ in the dark skin. The run takes a few seconds and prints:

    - ❌ computed-value mismatches, grouped by component — the only thing that fails the run (exit code 1);
    - ⚠️ selectors the tool couldn't build a matching DOM for, or whose pseudo-element Chromium can't compute (e.g. `::-webkit-slider-thumb`), so their own values may not have been compared;
    - ⚠️ selectors compared against the fallback: a Custom Property the rule reads is declared somewhere, but not on the element or any ancestor, even after the BEM context is added, so the `var()` fallback (the LESS value) is what got compared. It usually means the rule reads another component's Custom Property (see step 7);
    - ⏭️ selectors Chromium doesn't support (`::-moz-*`, `::-ms-*`), `@media` rules no emulated scenario matches, and rules inside other at-rules (e.g. `@supports`) or nested inside another rule.

    The tool lives in `editor/modules/oxide/tools/css-parity/` and is a local check, not run in CI.

    A conversion is done when the run passes **and** shows no ⚠️ warnings. Never leave a mismatch that "looks the same": either make the values match, or teach the tool the equivalence narrowly, with a comment in both the tool and the component.

    `css-parity` only checks the `default` and `dark` skins, with and without the flag. It doesn't cover the `tinymce-5` skins, the premium skins or content CSS. So also compile those skins with the flag off before and after your change, and compare them (treat `var(--tox-private-*, fallback)` as its fallback). Differences are only acceptable when they are the same value written differently, e.g. `0.075s` and `calc(0.15s / 2)`. This is how dropped composite fallbacks (step 3) and invalid `calc()`s (step 4) are found.

### LESS gotchas

- LESS evaluates its own functions with CSS names, such as `max()`, and fails on Custom Properties inside them. Escape the value: `--x: ~"max(var(--a) - var(--b), 0px)";`.
- LESS evaluates math and functions inside a `var()` fallback (`var(--x, @a - 1px)` compiles to `var(--x, -1px)`), which is what makes step 4 work.
- A `+` followed by a line break inside a Custom Property can break minification (see the comment in `button-secondary.less`); keep `calc(l + 15)` on one line or write `calc(l - -15)`.

---

## Summary

| Step | Description |
| --- | --- |
| Global Setup | Feature flag and global variables must be in place |
| Feature Flag | Use `@custom-properties-enabled` for safe feature rollout |
| Skins | Skins built on LESS variables (Oxide, premium, integrators') must keep working with the flag off. LESS variables are public API |
| CSS Variables | Use `tox-private` prefixed variables with the same LESS fallbacks as before, including composite ones |
| Valid Calculations | Keep LESS math on lengths in the fallback (`var(--x, @a - 1px)`), so a unitless `0` can't break `calc()` |
| Declaration Root | Declare Custom Properties on the component's real root element(s) |
| Global Variables | Prefer using a global CSS Custom Properties and promote shared variables to global scope, named by role |
| Fixed Values and States | Convert fixed-value LESS variables too, and mirror LESS state chains |
| Theme Logic | Replace LESS functions with `light-dark()` and use relative colors syntax; keep everything in the component file |
| Verify Parity | `bun run css-parity` passes with no warnings, and the flag-off output of the other skins computes the same as before |




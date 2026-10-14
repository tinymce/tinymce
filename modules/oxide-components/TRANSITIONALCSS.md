# Converting a Legacy Component to the Transitional Stage

This guide outlines the steps required to migrate a **Legacy** Oxide component (styled entirely with LESS) into the **Transitional** stage, where modern CSS features are introduced alongside existing LESS code under a feature flag. This incremental migration ensures backward compatibility while laying the foundation for future **Modern CSS** components.


## Global setup

Before converting individual components, several global configurations must be in place:

1. The `@custom-properties-enabled`  feature flag was introduced in [feature-flags.less](https://github.com/tinymce/tinymce/blob/main/modules/oxide/src/less/theme/globals/feature-flags.less).
2. A set of global CSS Custom Properties was created in [global-custom-properties.less](https://github.com/tinymce/tinymce/blob/main/modules/oxide/src/less/theme/globals/global-custom-properties.less).


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
    

4. **Use Global Custom Properties Where Needed**\
Prefer using a **global** CSS Custom Property instead of duplicating it locally. Component CSS Custom Properties should be created intentionally - when we want to introduce new API for skinning particular component style.\
You can reference a global variable directly, but remember to also include a fallback. Note, global CSS Custom Properties also come with the `tox-private` prefix for now:
    
    ```less
    color: var(--tox-private-text-color, @text-color);
    ```
    
5. **Promote Shared Variables to Global Scope**\
If a LESS variable is reused across multiple components, its corresponding CSS Custom Property should be made global. Component variables should not be cross-referenced in other components. 
    
6. **CSS Color Calculations (Relative Colors)**\
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

7. **Replace Theme-Based LESS Logic**\
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

8. **Verify Parity with the `css-parity` Tool**\
Once a component's rules are converted, confirm the custom-properties (flag on) output resolves to the same computed values as the LESS (flag off) output. Run it from `editor/modules/oxide/` — there's nothing to register:

    ```bash
    bun run css-parity
    ```

    It compiles the `default` and `dark` skins twice each (flag off/on), renders a DOM for every selector in the skin into headless Chromium — one page per compile per emulated media scenario — and compares the computed values. `:hover`/`:active`/`:focus`/`:focus-within`/`:focus-visible`/`:visited` are forced through the DevTools protocol, `:has()`, `:checked`, `:disabled` and structural pseudo-classes are synthesized, and rules inside `@media` are evaluated under emulated narrow-viewport and forced-colors conditions. The DOM follows BEM: an element class (`.tox-dialog__header`) is placed inside its block (`.tox-dialog`), and a modifier class (`.tox-checkbox--disabled`) also gets its base class (`.tox-checkbox`), so Custom Properties declared on a component's root reach the rules that read them. Only the custom properties build declares a `color-scheme` (`light-dark()` needs it), so the LESS page is given the same one — otherwise every system color, scrollbar and native control would differ in the dark skin. The run takes a few seconds and prints:

    - ❌ computed-value mismatches, grouped by component — the only thing that fails the run (exit code 1);
    - ⚠️ selectors the tool couldn't build a matching DOM for, or whose pseudo-element Chromium can't compute (e.g. `::-webkit-slider-thumb`), so their own values may not have been compared;
    - ⚠️ selectors compared against the fallback: a Custom Property the rule reads is declared somewhere, but not on the element or any ancestor, even after the BEM context is added, so the `var()` fallback (the LESS value) is what got compared. It usually means the rule reads another component's Custom Property (see step 5);
    - ⏭️ selectors Chromium doesn't support (`::-moz-*`, `::-ms-*`), `@media` rules no emulated scenario matches, and rules inside other at-rules (e.g. `@supports`) or nested inside another rule.

    The tool lives in `editor/modules/oxide/tools/css-parity/` and is a local check, not run in CI.

---

## Summary

| Step | Description |
| --- | --- |
| Global Setup | Feature flag and global variables must be in place |
| Feature Flag | Use `@custom-properties-enabled` for safe feature rollout |
| CSS Variables | Use `tox-private` prefixed variables with LESS fallbacks |
| Global Variables | Prefer using a global CSS Custom Properties and promote shared variables to global scope |
| Theme Logic | Replace LESS functions with `light-dark()` and use relative colors syntax |
| Verify Parity | Run `bun run css-parity` locally — checks every selector of the default and dark skins (not run in CI) |




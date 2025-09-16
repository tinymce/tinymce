# Converting a Legacy Component to the Transitional Stage

This guide outlines the steps required to migrate a **Legacy** Oxide component (styled entirely with LESS) into the **Transitional** stage, where modern CSS features are introduced alongside existing LESS code under a feature flag. This incremental migration ensures backward compatibility while laying the foundation for future **Modernized** components.

---

## Global setup

Before converting individual components, several global configurations must be in place:

1. The `@custom-properties-enabled`  feature flag was introduced [here](https://github.com/tinymce/tinymce/blob/main/modules/oxide/src/less/theme/globals/feature-flags.less).
2. A set of global CSS Custom Properties was created.  You can view them [here](https://github.com/tinymce/tinymce/blob/main/modules/oxide/src/less/theme/globals/global-custom-properties.less).
3. The Oxide theme now supports **CSS cascade layers** to improve specificity handling and maintain better control over the style cascade.

---

## Cascade Layers

We’re introducing structured cascade layers to reduce specificity issues and better organize style overrides. Here's how to use them correctly in LESS:

❗ **Important: LESS features (variables and mixins) must live outside of CSS layers.** ❗

### DO:

- Keep **LESS variable declarations and mixins** outside of layers. LESS variables can be referenced inside a layer but the declaration needs to be placed outside.
- Wrap **only the CSS rules** inside a `@layer`.

### Why Use Layers?

CSS layers allow rules to cascade together logically. Styles in later layers override earlier layers **regardless of specificity**, resulting in simpler and more maintainable CSS.

> Styles outside any layer will always override those inside layers.
> 
> 
> Learn more: [MDN – @layer](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer)
> 

### Layers We Use

| Layer Name | Purpose |
| --- | --- |
| `tox-reset` | Resets default browser styles |
| `tox-globals` | Global styles and Custom Properties. Overrides styles defined in `tox-reset`. |
| `tox-component` | Larger structural components (e.g., dialogs, menus). Overrides styles defined in `tox-reset` and `tox-globals`. |
| `tox-atomic-component` | Atomic components (e.g., buttons, checkboxes). Overrides styles defined in `tox-reset`, `tox-globals` and `tox-component`.  |

> 💡 Note: Because unlayered CSS is always applied last, larger components must be layered to avoid being unintentionally overridden by atomic ones. 
If you decide to wrap a component in a `tox-atomic-component` layer, remember to wrap possible parent components in a `tox-component` layer. See checkbox example: [Checkbox PR #10508](https://github.com/tinymce/tinymce/pull/10508)
> 

---

## Step-by-Step: Converting to the Transitional Stage

Having the information about the layers and global setup here are the steps you need to take to convert legacy component to transitional one:

1. **Wrap Component Styles in a CSS Layer**
Add your component’s style rules into a dedicated layer (e.g., `tox-atomic-component`):
    
    ```less
    @layer tox-atomic-component {
      .tox-button {
        padding: 4px;
      }
    }
    ```
    
2.  **Keep LESS Variables and Mixins Outside the Layer**
Any LESS logic should remain unlayered. You don’t need to change existing LESS variables declarations:
    
    ```less
    @btn-padding: 4px;
    
    @layer tox-atomic-component {
      .tox-button {
        padding: @btn-padding;
      }
    }
    ```
    
3. **Guard CSS Custom Properties with the Feature Flag**
Use the `@custom-properties-enabled` flag to define Custom Properties only when enabled:
    
    ```less
    .tox-button when (@custom-properties-enabled = true) {
      --tox-private-btn-padding: 4px;
    }
    ```
    
4. **Use Custom Properties with Fallbacks**
Always provide a fallback to the existing LESS variable for backward compatibility:
    
    ```less
    .tox-button {
    	padding: var(--tox-private-btn-padding, @btn-padding);
    }
    ```
    
5. **Prefix New CSS Custom Properties with `tox-private`**
Use the `tox-private` prefix for all new internal properties.
    
    > Why?
    This clearly signals internal, non-public usage. These variables can safely change during the migration process without affecting customers. We must retain the flexibility to revisit and adjust CSS Custom Properties without risking breaking changes for customers.
    > 
6. **Use Global Custom Properties Where Needed**
If the component references a widely used LESS variable, prefer using a **global** CSS Custom Property instead of duplicating it locally.
You can reference a global variable directly, but remember to also include a fallback:
    
    ```less
    color: var(--tox-private-text-color, @text-color);
    ```
    
7. **Promote Shared Variables to Global Scope**
If a LESS variable is reused across multiple components, its corresponding CSS Custom Property should be made global. Component varaibles should not be cross-referenced in other components. 
    
8. **Replace Theme-Based LESS Logic**
When creating CSS Custom Properties avoid using LESS functions like `contrast()` or `.bg-luma-checker`. Instead, use:
    - The `light-dark()` function
    - Relative color syntax in `hsl()` or other color models
    
    Example: 
    
    ```less
    .tox-button when (@custom-properties-enabled = true) {
      --tox-private-btn-bg: light-dark(#fff, #000);
    }
    ```
    
    > Avoid mixing LESS logic inside CSS Custom Property declarations. Keeping them purely in CSS will simplify the path to Modern CSS stage.
    > 
9. **CSS Color Calculations (Relative Colors)**
    
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

---

### Optional Step: Simplify Selectors with Layers + BEM:

Because layers resolve specificity issues, we can simplify overly strict selectors like:

```less
/* BEFORE (Legacy) */
.tox-checkbox .tox-checkbox__icons .tox-checkbox__icon__checked svg {
  ...
}

/* AFTER (Transitional) */
.tox-checkbox__icon__checked svg {
  ...
}
```

BEM + Layers means you no longer need redundant nesting to guarantee specificity.
Simpler selectors are more readable in the browser.

---

## Summary

| Step | Description |
| --- | --- |
| Global Setup | Feature flag, cascade layers, and global variables must be in place |
| CSS Layers | Organize rules with `@layer`, keeping LESS logic outside |
| Feature Flag | Use `@custom-properties-enabled` for safe feature rollout |
| CSS Variables | Use `tox-private` prefixed variables with LESS fallbacks |
| Global Variables | Promote shared variables to global scope |
| Theme Logic | Replace LESS functions with `light-dark()` and relative colors |
| Optional | Simplify selectors using BEM and layer control |

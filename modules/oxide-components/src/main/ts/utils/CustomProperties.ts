import { Obj, Type } from '@ephox/katamari';
import type { CustomPropertyGroups, CustomPropertyName, RuntimeCustomPropertyName } from '@tinymce/oxide/custom-properties/types.ts';
import type { CSSProperties } from 'react';

/** Full name of any property the skin declares or reads, e.g. `--tox-private-color-tint`. */
export type CustomProperty = CustomPropertyName | RuntimeCustomPropertyName;

/** A group of declared properties, named after the LESS file that declares them, e.g. `notification`. */
export type CustomPropertyGroup = keyof CustomPropertyGroups;

/** Full names of the properties declared by one group. */
export type CustomPropertyOf<G extends CustomPropertyGroup> = CustomPropertyGroups[G];

// Strings only: React doesn't add `px` to custom properties, so a number would be unitless.
type Values<P extends string> = Partial<Record<P, string>>;

// Excess-property checks only cover object literals; this rejects extra keys on variables too.
type Exact<V, P extends string> = V & Record<Exclude<keyof V, P>, never>;

/**
 * Returns a `var()` reference to the property, with an optional fallback.
 *
 * @example
 * CustomProperties.ref('--tox-private-floating-sidebar-width');
 * // Returns: 'var(--tox-private-floating-sidebar-width)'
 * CustomProperties.ref('--tox-private-spinner-color', 'currentColor');
 * // Returns: 'var(--tox-private-spinner-color, currentColor)'
 */
export const ref = (property: CustomProperty, fallback?: string): string =>
  fallback === undefined ? `var(${property})` : `var(${property}, ${fallback})`;

const toStyle = (values: Values<string>): CSSProperties => {
  const result: Record<string, string> = {};
  Obj.each(values, (value, property) => {
    if (!Type.isUndefined(value)) {
      result[property] = value;
    }
  });
  return result satisfies CSSProperties;
};

/**
 * Builds a React `style` object that sets custom properties. Undefined values are skipped.
 *
 * @example
 * <div style={CustomProperties.style({ '--tox-private-spinner-color': 'red' })} />
 * // Renders: <div style="--tox-private-spinner-color: red">
 */
export const style = <V extends Values<CustomProperty>>(values: Exact<V, CustomProperty>): CSSProperties => toStyle(values);

/**
 * Like `style`, but only accepts properties declared by the given group, so a component
 * can't accidentally set another component's tokens.
 *
 * @example
 * CustomProperties.groupStyle('tinymceai/spinner', { '--tox-private-spinner-size': '24px' });
 */
export const groupStyle = <G extends CustomPropertyGroup, V extends Values<CustomPropertyOf<G>>>(
  _group: G,
  values: Exact<V, CustomPropertyOf<G>>
): CSSProperties => toStyle(values);

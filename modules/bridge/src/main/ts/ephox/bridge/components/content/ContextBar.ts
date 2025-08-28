import { FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

export type ContextPosition = 'node' | 'selection' | 'line';
export type ContextScope = 'node' | 'editor';

export interface ContextBarSpec {
  predicate?: (elem: Element) => boolean;
  position?: ContextPosition;
  scope?: ContextScope;
}

export interface ContextBar {
  predicate: (elem: Element) => boolean;
  position: ContextPosition;
  scope: ContextScope;
}

export const contextBarFields = [
  FieldSchema.defaultedFunction('predicate', Fun.never),
  FieldSchema.defaultedStringEnum('scope', 'node', [ 'node', 'editor' ]),
  FieldSchema.defaultedStringEnum('position', 'selection', [ 'node', 'selection', 'line' ])
];

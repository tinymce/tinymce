import { FieldSchema } from '@ephox/boulder';

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
  FieldSchema.defaultedFunction('predicate', () => false),
  FieldSchema.defaultedStringEnum('scope', 'node', [ 'node', 'editor' ]),
  FieldSchema.defaultedStringEnum('position', 'selection', [ 'node', 'selection', 'line' ])
];

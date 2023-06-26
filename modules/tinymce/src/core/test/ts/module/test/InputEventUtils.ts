import { Type } from '@ephox/katamari';

const deprecated = new Set([
  'keyLocation', 'layerX', 'layerY', 'returnValue',
  'webkitMovementX', 'webkitMovementY',
  'keyIdentifier', 'mozPressure'
]);

const clone = <T extends Event>(originalEvent: T): T => {
  const event: Record<string, any> = {};

  // Copy all properties from the original event
  for (const name in originalEvent) {
    // Some properties are deprecated and produces a warning so don't include them
    if (!deprecated.has(name)) {
      event[name] = originalEvent[name];
    }
  }

  // The composed path can't be cloned, so delegate instead
  // eslint-disable-next-line @typescript-eslint/unbound-method
  if (Type.isNonNullable(originalEvent.composedPath)) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    event.composedPath = () => originalEvent.composedPath!();
  }

  return event as T;
};

export const makeInputEvent = <A extends InputEvent>(name: 'beforeinput' | 'input', overrides: { [K in keyof A]?: A[K] }): InputEvent => {
  return { ...clone(new InputEvent(name)), ...overrides };
};

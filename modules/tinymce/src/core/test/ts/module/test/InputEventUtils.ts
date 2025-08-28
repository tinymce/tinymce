import { Type } from '@ephox/katamari';

const deprecated = new Set([
  'keyLocation', 'layerX', 'layerY', 'returnValue',
  'webkitMovementX', 'webkitMovementY',
  'keyIdentifier', 'mozPressure'
]);

type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

const cloneEvent = <T extends Event>(originalEvent: T): T => {
  const event: Mutable<T> = {} as Mutable<T>;

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

  // The preventDefault can't be cloned, so delegate instead
  event.preventDefault = () => {
    originalEvent.preventDefault();
    event.defaultPrevented = true;
  };

  return event;
};

export const makeInputEvent = <A extends InputEvent>(name: 'beforeinput' | 'input', overrides: { [K in keyof A]?: A[K] }): InputEvent => {
  return { ...cloneEvent(new InputEvent(name, { cancelable: true })), ...overrides };
};

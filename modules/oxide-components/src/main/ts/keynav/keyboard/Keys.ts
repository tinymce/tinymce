// TODO: This file would need to be updated once we work on https://ephocks.atlassian.net/browse/TINY-8724

export interface Key {
  readonly code: string;
  readonly key: string;
  readonly which: number;
}

const TAB: ReadonlyArray<Key> = [{ code: 'Tab', key: 'Tab', which: 9 }];
const ENTER: ReadonlyArray<Key> = [{ code: 'Enter', key: 'Enter', which: 13 }];
const SHIFT: ReadonlyArray<Key> = [
  { code: 'ShiftLeft', key: 'Shift', which: 16 },
  { code: 'ShiftRight', key: 'Shift', which: 16 },
];
const END: ReadonlyArray<Key> = [{ code: 'End', key: 'End', which: 35 }];
const LEFT: ReadonlyArray<Key> = [{ code: 'ArrowLeft', key: 'ArrowLeft', which: 37 }];
const UP: ReadonlyArray<Key> = [{ code: 'ArrowUp', key: 'ArrowUp', which: 38 }];
const RIGHT: ReadonlyArray<Key> = [{ code: 'ArrowRight', key: 'ArrowRight', which: 39 }];
const DOWN: ReadonlyArray<Key> = [{ code: 'ArrowDown', key: 'ArrowDown', which: 40 }];
const SPACE: ReadonlyArray<Key> = [{ code: 'Space', key: ' ', which: 32 }];
const ESCAPE: ReadonlyArray<Key> = [{ code: 'Escape', key: 'Escape', which: 27 }];

export {
  TAB,
  ENTER,
  SHIFT,
  END,
  LEFT,
  UP,
  RIGHT,
  DOWN,
  SPACE,
  ESCAPE
};

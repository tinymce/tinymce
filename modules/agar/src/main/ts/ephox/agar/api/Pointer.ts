import type { SugarElement } from '@ephox/sugar';

import * as Pointers from '../pointer/Pointers';

const pointerDown = (element: SugarElement<Node>, settings: Pointers.Settings = { }): void => Pointers.pointerDown(settings)(element);
const pointerUp = (element: SugarElement<Node>, settings: Pointers.Settings = { }): void => Pointers.pointerUp(settings)(element);
const pointerMove = (element: SugarElement<Node>, settings: Pointers.Settings = { }): void => Pointers.pointerMove(settings)(element);
const pointerMoveTo = (element: SugarElement<Node>, dx: number, dy: number, settings: Omit<Pointers.Settings, 'dx' | 'dy'> = { }): void =>
  Pointers.pointerMove({ ...settings, dx, dy })(element);

const event = Pointers.event;

export {
  pointerDown,
  pointerUp,
  pointerMove,
  pointerMoveTo,
  event
};

import { Optional } from '@ephox/katamari';
import { type EventArgs, SugarPosition } from '@ephox/sugar';

const getData = (event: EventArgs<PointerEvent>): Optional<SugarPosition> => Optional.from(SugarPosition(event.x, event.y));

const getDelta = (old: SugarPosition, nu: SugarPosition): SugarPosition => SugarPosition(nu.left - old.left, nu.top - old.top);

export {
  getData,
  getDelta
};

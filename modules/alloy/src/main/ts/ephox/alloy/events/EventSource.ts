import { Cell, Obj } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import { EventFormat } from './SimulatedEvent';

const derive = (rawEvent: EventFormat, rawTarget: SugarElement): Cell<SugarElement> => {
  const source = Obj.get(rawEvent, 'target').getOr(rawTarget);

  return Cell(source);
};

export {
  derive
};

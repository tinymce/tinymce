import { Cell, Obj } from '@ephox/katamari';
import type { SugarElement } from '@ephox/sugar';

import type { EventFormat } from './SimulatedEvent';

const derive = (rawEvent: EventFormat, rawTarget: SugarElement<Node>): Cell<SugarElement<Node>> => {
  const source = Obj.get(rawEvent, 'target').getOr(rawTarget);

  return Cell(source);
};

export {
  derive
};

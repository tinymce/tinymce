import { Cell, Obj } from '@ephox/katamari';
import { Element } from '@ephox/sugar';

import { EventFormat } from './SimulatedEvent';

const derive = (rawEvent: EventFormat, rawTarget: Element): Cell<Element> => {
  const source = Obj.get(rawEvent, 'target').map((getTarget) => getTarget()).getOr(rawTarget);

  return Cell(source);
};

export {
  derive
};

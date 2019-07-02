import { Objects } from '@ephox/boulder';
import { Cell } from '@ephox/katamari';
import { Element } from '@ephox/sugar';

import { EventFormat } from './SimulatedEvent';

const derive = (rawEvent: EventFormat, rawTarget: Element): Cell<Element> => {
  const source = Objects.readOptFrom<() => Element>(rawEvent, 'target').map((getTarget) => {
    return getTarget();
  }).getOr(rawTarget);

  return Cell(source);
};

export {
  derive
};

import { Objects } from '@ephox/boulder';
import { Cell } from '@ephox/katamari';
import { EventFormat } from './SimulatedEvent';
import { SugarElement } from 'ephox/alloy/api/Main';

const derive = (rawEvent: EventFormat, rawTarget: SugarElement): Cell<SugarElement> => {
  const source = Objects.readOptFrom(rawEvent, 'target').map((getTarget) => {
    return getTarget();
  }).getOr(rawTarget);

  return Cell(source);
};

export {
  derive
};
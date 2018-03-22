import { Compare } from '@ephox/sugar';

const isSource = function (component, simulatedEvent) {
  return Compare.eq(component.element(), simulatedEvent.event().target());
};

export {
  isSource
};
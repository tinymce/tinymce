import { Compare } from '@ephox/sugar';

const isSource = (component, simulatedEvent) => {
  return Compare.eq(component.element(), simulatedEvent.event().target());
};

export {
  isSource
};
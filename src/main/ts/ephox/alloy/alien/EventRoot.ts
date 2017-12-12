import { Compare } from '@ephox/sugar';

var isSource = function (component, simulatedEvent) {
  return Compare.eq(component.element(), simulatedEvent.event().target());
};

export default <any> {
  isSource: isSource
};
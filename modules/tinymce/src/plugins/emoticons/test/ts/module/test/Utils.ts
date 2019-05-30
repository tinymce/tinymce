import { Chain, Guard } from '@ephox/agar';
import { document } from '@ephox/dom-globals';
import { Element } from '@ephox/sugar';

// TODO: Move into shared library (eg agar)
const cFakeEvent = (name: string) => {
  return Chain.control(
    Chain.op((elm: Element) => {
      const evt = document.createEvent('HTMLEvents');
      evt.initEvent(name, true, true);
      elm.dom().dispatchEvent(evt);
    }),
    Guard.addLogging('Fake event')
  );
};

export {
  cFakeEvent
};
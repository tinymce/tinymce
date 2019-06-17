import { clearTimeout, setTimeout } from '@ephox/dom-globals';
import { Future, LazyValue, Result } from '@ephox/katamari';
import * as DomEvent from '../events/DomEvent';
import Element from '../node/Element';

const w = function (fType, element: Element, eventType: string, timeout: number) {
  return fType(function (callback) {
    const listener = DomEvent.bind(element, eventType, function (event) {
      clearTimeout(time);
      listener.unbind();
      callback(Result.value(event));
    });

    const time = setTimeout(function () {
      listener.unbind();
      callback(Result.error('Event ' + eventType + ' did not fire within ' + timeout + 'ms'));
    }, timeout);
  });
};

const cWaitFor = function (element: Element, eventType: string, timeout: number) {
  return w(LazyValue.nu, element, eventType, timeout);
};

const waitFor = function (element: Element, eventType: string, timeout: number) {
  return w(Future.nu, element, eventType, timeout);
};

export { cWaitFor, waitFor, };

import { clearTimeout, setTimeout } from '@ephox/dom-globals';
import { Future, LazyValue, Result } from '@ephox/katamari';
import * as DomEvent from '../events/DomEvent';
import Element from '../node/Element';
import { EventArgs } from '../events/Types';

type FTypeCallback<T> = (completer: (callback: (result: Result<EventArgs, string>) => void) => void) => T;

const w = function <T> (fType: FTypeCallback<T>, element: Element, eventType: string, timeout: number): T {
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

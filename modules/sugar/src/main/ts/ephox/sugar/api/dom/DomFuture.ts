import { clearTimeout, Event, setTimeout } from '@ephox/dom-globals';
import { Future, LazyValue, Result } from '@ephox/katamari';
import * as DomEvent from '../events/DomEvent';
import { EventArgs } from '../events/Types';
import Element from '../node/Element';

const q = <E extends Event>(element: Element<unknown>, eventType: string, timeout: number) => (callback: (r: Result<EventArgs<E>, string>) => void): void => {
  const listener = DomEvent.bind<E>(element, eventType, (event) => {
    clearTimeout(time);
    listener.unbind();
    callback(Result.value(event));
  });

  const time = setTimeout(() => {
    listener.unbind();
    callback(Result.error('Event ' + eventType + ' did not fire within ' + timeout + 'ms'));
  }, timeout);
};

const cWaitFor = <E extends Event>(element: Element<unknown>, eventType: string, timeout: number): LazyValue<Result<EventArgs<E>, string>> =>
  LazyValue.nu(q(element, eventType, timeout));

const waitFor = (element: Element, eventType: string, timeout: number) => Future.nu(q(element, eventType, timeout));

export { cWaitFor, waitFor };

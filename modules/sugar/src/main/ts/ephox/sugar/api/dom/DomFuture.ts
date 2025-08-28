import { Future, LazyValue, Result } from '@ephox/katamari';

import * as DomEvent from '../events/DomEvent';
import { EventArgs } from '../events/Types';
import { SugarElement } from '../node/SugarElement';

type WorkDone = (res: Result<EventArgs, string>) => void;
type Worker = (callback: WorkDone) => void;
type TaskConstructor<T> = (worker: Worker) => T;

const w = <T> (fType: TaskConstructor<T>, element: SugarElement<EventTarget>, eventType: string, timeout: number) => fType((callback) => {
  const listener = DomEvent.bind(element, eventType, (event) => {
    clearTimeout(time);
    listener.unbind();
    callback(Result.value(event));
  });

  const time = setTimeout(() => {
    listener.unbind();
    callback(Result.error('Event ' + eventType + ' did not fire within ' + timeout + 'ms'));
  }, timeout);
});

const cWaitFor = (element: SugarElement<EventTarget>, eventType: string, timeout: number): LazyValue<Result<EventArgs, string>> =>
  w(LazyValue.nu, element, eventType, timeout);

const waitFor = (element: SugarElement<EventTarget>, eventType: string, timeout: number): Future<Result<EventArgs, string>> =>
  w<Future<Result<EventArgs, string>>>(Future.nu, element, eventType, timeout);

export { cWaitFor, waitFor };

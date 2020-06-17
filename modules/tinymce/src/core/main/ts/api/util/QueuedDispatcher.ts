import { Arr, Option } from '@ephox/katamari';

/** A handler for calls to a function that's not ready to be provided yet.
 *  Once the function has been provided, the queued calls are dispatched,
 *  and future calls go directly to the function.
 */
export interface QueuedDispatcher<A> {
  readonly queue: (a: A) => void;
  readonly set: (f: (a: A) => void) => void;
}

export const queuedDispatcher = <A> () => {

  let q: A[] = [];
  let odisp: Option<(a: A) => void> = Option.none();

  const queue = (a: A): void => {
    odisp.fold(
      () => {
        q.push(a);
      },
      (f) => f(a)
    );
  };

  const set = (f: (a: A) => void): void => {
    odisp = Option.some(f);
    Arr.each(q, (qq) => {
      f(qq);
    });
    q = [];
  };

  return {
    queue,
    set
  };
};

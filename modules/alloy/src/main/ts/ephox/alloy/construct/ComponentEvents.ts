import { Objects } from '@ephox/boulder';
import { Arr, Obj, Optional, Result } from '@ephox/katamari';

import * as ObjIndex from '../alien/ObjIndex';
import * as PrioritySort from '../alien/PrioritySort';
import { AlloyBehaviour } from '../api/behaviour/Behaviour';
import { AlloyComponent } from '../api/component/ComponentApi';
import { AlloyEventHandler, AlloyEventRecord } from '../api/events/AlloyEvents';
import * as BehaviourBlob from '../behaviour/common/BehaviourBlob';
import { BehaviourState } from '../behaviour/common/BehaviourState';
import * as DescribedHandler from '../events/DescribedHandler';
import { UncurriedHandler } from '../events/EventRegistry';
import { EventFormat, SimulatedEvent } from '../events/SimulatedEvent';
import * as EventHandler from './EventHandler';

/*
 * The process of combining a component's events
 *
 * - Generate all the handlers based on the behaviour and the base events
 * - Create an index (eventName -> [tuples(behaviourName, handler)])
 * - Map over this index:
 *    - if the list == length 1, then collapse it to the head value
 *    - if the list > length 1, then:
 *        - sort the tuples using the behavour name ordering specified using
            eventOrder[event]. Return error if insufficient
 *        - generate a can, run, and abort that combines the handlers of the
            tuples in the sorted order
 *
 * So at the end, you should have Result(eventName -> single function)
 */

type Info = Record<string, () => Optional<BehaviourBlob.BehaviourConfigAndState<any, BehaviourState>>>;

interface BehaviourTuple<T extends EventFormat> {
  readonly name: string;
  readonly handler: AlloyEventHandler<T>;
}

const behaviourTuple = <T extends EventFormat>(name: string, handler: AlloyEventHandler<T>): BehaviourTuple<T> => ({
  name,
  handler
});

const nameToHandlers = (behaviours: Array<AlloyBehaviour<any, any>>, info: Info) => {
  const r: Record<string, any> = {};
  Arr.each(behaviours, (behaviour) => {
    r[behaviour.name()] = behaviour.handlers(info);
  });
  return r;
};

const groupByEvents = (info: Info, behaviours: Array<AlloyBehaviour<any, any>>, base: Record<string, AlloyEventRecord>) => {
  const behaviourEvents: Record<string, Record<string, AlloyEventHandler<any>>> = {
    ...base,
    ...nameToHandlers(behaviours, info)
  };
  // Now, with all of these events, we need to index by event name
  return ObjIndex.byInnerKey(behaviourEvents, behaviourTuple);
};

const combine = (
  info: Info,
  eventOrder: Record<string, string[]>,
  behaviours: Array<AlloyBehaviour<any, any, any>>,
  base: Record<string, AlloyEventRecord>
): Result<Record<string, UncurriedHandler>, string[]> => {
  const byEventName: Record<string, Array<BehaviourTuple<any>>> = groupByEvents(info, behaviours, base);
  return combineGroups(byEventName, eventOrder);
};

const assemble = <T extends EventFormat>(rawHandler: AlloyEventHandler<T>) => {
  const handler = EventHandler.read(rawHandler);
  return (component: AlloyComponent, simulatedEvent: SimulatedEvent<T>, ...rest: any[]) => {
    const args = ([ component, simulatedEvent ] as any).concat(rest);
    if (handler.abort.apply(undefined, args)) {
      simulatedEvent.stop();
    } else if (handler.can.apply(undefined, args)) {
      handler.run.apply(undefined, args);
    }
  };
};

const missingOrderError = <T> (eventName: string, tuples: Array<BehaviourTuple<any>>): Result<T, string[]> => Result.error([
  'The event (' + eventName + ') has more than one behaviour that listens to it.\nWhen this occurs, you must ' +
    'specify an event ordering for the behaviours in your spec (e.g. [ "listing", "toggling" ]).\nThe behaviours that ' +
    'can trigger it are: ' + JSON.stringify(Arr.map(tuples, (c) => c.name), null, 2)
]);

const fuse = <T extends EventFormat>(tuples: Array<BehaviourTuple<T>>, eventOrder: Record<string, string[]>, eventName: string): Result<AlloyEventHandler<T>, any[]> => {
  // ASSUMPTION: tuples.length will never be 0, because it wouldn't have an entry if it was 0
  const order = eventOrder[eventName];
  if (!order) {
    return missingOrderError(eventName, tuples);
  } else {
    return PrioritySort.sortKeys('Event: ' + eventName, 'name', tuples, order).map(
      (sortedTuples) => {
        const handlers = Arr.map(sortedTuples, (tuple) => tuple.handler);
        return EventHandler.fuse(handlers);
      }
    );
  }
};

const combineGroups = <T extends EventFormat>(byEventName: Record<string, Array<BehaviourTuple<T>>>, eventOrder: Record<string, string[]>) => {
  const r = Obj.mapToArray(byEventName, (tuples, eventName) => {
    const combined: Result<AlloyEventHandler<T>, any[]> = tuples.length === 1 ? Result.value(tuples[0].handler) : fuse<T>(tuples, eventOrder, eventName);
    return combined.map((handler) => {
      const assembled = assemble(handler);
      const purpose = tuples.length > 1 ? Arr.filter(eventOrder[eventName], (o) => Arr.exists(tuples, (t) => t.name === o)).join(' > ') : tuples[0].name;
      return Objects.wrap(eventName, DescribedHandler.uncurried(assembled, purpose));
    });
  });

  return Objects.consolidate(r, {});
};

export {
  combine
};

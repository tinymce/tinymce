import { Objects } from '@ephox/boulder';
import { Arr, Fun, Merger, Obj, Result } from '@ephox/katamari';
import { JSON as Json } from '@ephox/sand';

import * as ObjIndex from '../alien/ObjIndex';
import * as PrioritySort from '../alien/PrioritySort';
import * as DescribedHandler from '../events/DescribedHandler';
import * as EventHandler from './EventHandler';
import { UncurriedHandler } from '../events/EventRegistry';
import { LumberTimers } from '../alien/LumberTimers';

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
const behaviourTuple = (name, handler) => {
  return {
    name: Fun.constant(name),
    handler: Fun.constant(handler)
  };
};

const nameToHandlers = (behaviours, info) => {
  const r = {};
  Arr.each(behaviours, (behaviour) => {
    r[behaviour.name()] = LumberTimers.run('nameToHandler', () => behaviour.handlers(info));
  });
  return r;
};

const groupByEvents = (info, behaviours, base) => {
  const handlers = LumberTimers.run('nameToHandlers', () => nameToHandlers(behaviours, info));
  const behaviourEvents = LumberTimers.run('groupMerge', () => Merger.merge(base, handlers));
  // Now, with all of these events, we need to index by event name
  return LumberTimers.run('byInnerKey', () => ObjIndex.byInnerKey(behaviourEvents, behaviourTuple));
};

const combine = (info, eventOrder, behaviours, base): Result<Record<string, UncurriedHandler>, string | Error> => {
  const byEventName = LumberTimers.run('groupByEvents', () => groupByEvents(info, behaviours, base));
  return LumberTimers.run('combineGroups', () => combineGroups(byEventName, eventOrder));
};

const assemble = (rawHandler) => {
  const handler = EventHandler.read(rawHandler);
  return (component, simulatedEvent, ...rest) => {
    const args = [ component, simulatedEvent ].concat(rest);
    if (handler.abort.apply(undefined, args)) {
      simulatedEvent.stop();
    } else if (handler.can.apply(undefined, args)) {
      handler.run.apply(undefined, args);
    }
  };
};

const missingOrderError = (eventName, tuples) => {
  return Result.error([
    'The event (' + eventName + ') has more than one behaviour that listens to it.\nWhen this occurs, you must ' +
    'specify an event ordering for the behaviours in your spec (e.g. [ "listing", "toggling" ]).\nThe behaviours that ' +
    'can trigger it are: ' + Json.stringify(Arr.map(tuples, (c) => c.name()), null, 2)
  ]);
};

const fuse = (tuples, eventOrder, eventName) => {
  return LumberTimers.run('fuse', () => {
    // ASSUMPTION: tuples.length will never be 0, because it wouldn't have an entry if it was 0
    const order = eventOrder[eventName];
    if (! order) { return missingOrderError(eventName, tuples); } else { return PrioritySort.sortKeys('Event: ' + eventName, 'name', tuples, order).map((sortedTuples) => {
      const handlers = Arr.map(sortedTuples, (tuple) => tuple.handler());
      return EventHandler.fuse(handlers);
    });
    }
  });
};

const combineGroups = (byEventName, eventOrder) => {
  let failed = [ ];
  const success = { };

  Obj.each(byEventName, (tuples, eventName) => {
    if (failed.length > 0) {
      return;
    }
    const combined = tuples.length === 1 ? Result.value(tuples[0].handler()) : fuse(tuples, eventOrder, eventName);
    combined.fold(
      (errs) => {
        failed = failed.concat(errs);
      },
      (val) => {
        success[eventName] = DescribedHandler.uncurried(
          assemble(val), ''
        )
      }
    )
  });

  if (failed.length > 0) { return Result.error(failed); }
  else return Result.value(success);


  const r = Obj.mapToArray(byEventName, (tuples, eventName) => {
    const combined = tuples.length === 1 ? Result.value(tuples[0].handler()) : fuse(tuples, eventOrder, eventName);
    return LumberTimers.run('combineGroups.map', () => combined.map((handler) => {
      const assembled = assemble(handler);
      const purpose = '';
      // const purpose = tuples.length > 1 ? Arr.filter(eventOrder, (o) => {
      //   return Arr.contains(tuples, (t) => t.name() === o);
      // }).join(' > ') : tuples[0].name();
      return Objects.wrap(eventName, DescribedHandler.uncurried(assembled, purpose));
    }));
  });

  return LumberTimers.run('combineGroups.consolidate', () => Objects.consolidate(r, {}));
};

export {
  combine
};
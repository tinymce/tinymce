import ObjIndex from '../alien/ObjIndex';
import PrioritySort from '../alien/PrioritySort';
import EventHandler from './EventHandler';
import DescribedHandler from '../events/DescribedHandler';
import { Objects } from '@ephox/boulder';
import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Merger } from '@ephox/katamari';
import { Obj } from '@ephox/katamari';
import { Result } from '@ephox/katamari';
import { JSON as Json } from '@ephox/sand';

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
var behaviourTuple = function (name, handler) {
  return {
    name: Fun.constant(name),
    handler: Fun.constant(handler)
  };
};

var nameToHandlers = function (behaviours, info) {
  var r = {};
  Arr.each(behaviours, function (behaviour) {
    r[behaviour.name()] = behaviour.handlers(info);
  });
  return r;
};

var groupByEvents = function (info, behaviours, base) {
  var behaviourEvents = Merger.deepMerge(base, nameToHandlers(behaviours, info));
  // Now, with all of these events, we need to index by event name
  return ObjIndex.byInnerKey(behaviourEvents, behaviourTuple);
};

var combine = function (info, eventOrder, behaviours, base) {
  var byEventName = groupByEvents(info, behaviours, base);
  return combineGroups(byEventName, eventOrder);
};

var assemble = function (rawHandler) {
  var handler = EventHandler.read(rawHandler);
  return function (component, simulatedEvent/*, others */) {
    var args = Array.prototype.slice.call(arguments, 0);
    if (handler.abort.apply(undefined, args)) {
      simulatedEvent.stop();
    } else if (handler.can.apply(undefined, args)) {
      handler.run.apply(undefined, args);
    }
  };
};

var missingOrderError = function (eventName, tuples) {
  return new Result.error([
    'The event (' + eventName + ') has more than one behaviour that listens to it.\nWhen this occurs, you must ' +
    'specify an event ordering for the behaviours in your spec (e.g. [ "listing", "toggling" ]).\nThe behaviours that ' +
    'can trigger it are: ' + Json.stringify(Arr.map(tuples, function (c) { return c.name(); }), null, 2)
  ]);
};

var fuse = function (tuples, eventOrder, eventName) {
  // ASSUMPTION: tuples.length will never be 0, because it wouldn't have an entry if it was 0
  var order = eventOrder[eventName];
  if (! order) return missingOrderError(eventName, tuples);
  else return PrioritySort.sortKeys('Event: ' + eventName, 'name', tuples, order).map(function (sortedTuples) {
    var handlers = Arr.map(sortedTuples, function (tuple) { return tuple.handler(); });
    return EventHandler.fuse(handlers);
  });
};

var combineGroups = function (byEventName, eventOrder) {
  var r = Obj.mapToArray(byEventName, function (tuples, eventName) {
    var combined = tuples.length === 1 ? Result.value(tuples[0].handler()) : fuse(tuples, eventOrder, eventName);
    return combined.map(function (handler) {
      var assembled = assemble(handler);
      var purpose = tuples.length > 1 ? Arr.filter(eventOrder, function (o) {
        return Arr.contains(tuples, function (t) { return t.name() === o; });
      }).join(' > ') : tuples[0].name();
      return Objects.wrap(eventName, DescribedHandler.nu(assembled, purpose));
    });
  });

  return Objects.consolidate(r, {});
};

export default <any> {
  combine: combine
};
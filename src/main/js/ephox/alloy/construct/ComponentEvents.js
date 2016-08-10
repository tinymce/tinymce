define(
  'ephox.alloy.construct.ComponentEvents',

  [
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.util.ObjIndex',
    'ephox.alloy.util.PrioritySort',
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.highway.Merger',
    'ephox.numerosity.api.JSON',
    'ephox.peanut.Fun',
    'ephox.perhaps.Result',
    'global!Array',
    'global!Error'
  ],

  function (EventHandler, ObjIndex, PrioritySort, Arr, Obj, Merger, Json, Fun, Result, Array, Error) {
    /*
     * The process of combining a component's events
     *
     * - Generate all the handlers based on the behaviour and the base events
     * - Create an index (eventName -> [tuples(behaviourName, handler)])
     * - Map over this index:
     *    - if the list == length 1, then collapse it to the head value
     *    - if the list > length 1, then:
     *        - sort the tuples using the behavour name ordering specified using 
                eventOrder[event]. Throw error if insuccifient
     *        - generate a can, run, and abort that combines the handlers of the 
                tuples in the sorted order
     *
     * So at the end, you should have (eventName -> single function)
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
      // FIX: behaviourEvents['lab.custom.definition.events'] = CustomDefinition.toEvents(info);
      var behaviourEvents = Merger.deepMerge(base, nameToHandlers(behaviours, info));
      
      // Now, with all of these events, we need to index by event name
      return ObjIndex.byInnerKey(behaviourEvents, behaviourTuple);
    };

    var combine = function (info, behaviours, base) {
      var byEventName = groupByEvents(info, behaviours, base);
      return combineGroups(byEventName, info.eventOrder());
    };

    var assemble = function (handler) {
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
      return new Result.error(
        'The event (' + eventName + ') has more than one behaviour that listens to it.\nWhen this occurs, you must ' + 
        'specify an event ordering for the behaviours in your spec (e.g. [ "listing", "toggling" ]).\nThe behaviours that ' + 
        'can trigger it are: ' + Json.stringify(Arr.map(tuples, function (c) { return c.name(); }), null, 2)
      );        
    };

    var fuse = function (tuples, eventOrder, eventName) {
      // ASSUMPTION: tuples.length will never be 0, because it wouldn't have an entry if it was 0
      var order = eventOrder[eventName];
      if (! order) return missingOrderError(eventName, tuples);
      else return PrioritySort.sortKeys('Event', 'name', tuples, order).map(function (sortedTuples) {
        var handlers = Arr.map(sortedTuples, function (tuple) { return tuple.handler(); });
        return EventHandler.fuse(handlers);
      });
    };

    var combineGroups = function (byEventName, eventOrder) {
      return Obj.map(byEventName, function (tuples, eventName) {
        var combined = tuples.length === 1 ? Result.value(tuples[0].handler()) : fuse(tuples, eventOrder, eventName);
        return combined.map(assemble).getOrDie();
      });
    };
   
    return {
      combine: combine
    };
  }
);
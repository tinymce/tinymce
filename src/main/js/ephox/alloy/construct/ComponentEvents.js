define(
  'ephox.alloy.construct.ComponentEvents',

  [
    'ephox.alloy.construct.EventFusion',
    'ephox.alloy.util.ObjIndex',
    'ephox.alloy.util.PrioritySort',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.highway.Merger',
    'ephox.numerosity.api.JSON',
    'ephox.peanut.Fun',
    'ephox.perhaps.Result',
    'global!Array',
    'global!Error'
  ],

  function (EventFusion, ObjIndex, PrioritySort, FieldPresence, FieldSchema, Objects, ValueSchema, Arr, Obj, Merger, Json, Fun, Result, Array, Error) {
    var behaviourHandler = function (name, handler) {
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

    var combine = function (info, behaviours, base) {
      // FIX: behaviourEvents['lab.custom.definition.events'] = CustomDefinition.toEvents(info);
      var behaviourEvents = Merger.deepMerge(base, nameToHandlers(behaviours, info));
      
      // Now, with all of these events, we need to index by event name
      var byEventName = ObjIndex.byInnerKey(behaviourEvents, behaviourHandler);

      return combineEventLists(byEventName, info.eventOrder());
    };

    var assemble = function (handler) {
      console.log('assemble.handler', handler);
      return function (component, simulatedEvent/*, others */) {
        console.log('running.handler', handler);
        var args = Array.prototype.slice.call(arguments, 0);
        if (handler.abort.apply(undefined, args)) {
          simulatedEvent.stop();
        } else if (handler.can.apply(undefined, args)) {
          handler.run.apply(undefined, args);
        }
      };
    };

    var missingOrderError = function (eventName, listeners) {
      return new Result.error(
        'The event (' + eventName + ') has more than one behaviour that listens to it.\nWhen this occurs, you must ' + 
        'specify an event ordering for the behaviours in your spec (e.g. [ "listing", "toggling" ]).\nThe behaviours that ' + 
        'can trigger it are: ' + Json.stringify(Arr.map(listeners, function (c) { return c.name(); }), null, 2)
      );        
    };

    var fuse = function (listeners, eventOrder, eventName) {
      var order = eventOrder[eventName];
      if (! order) return missingOrderError(eventName, listeners);
      else return PrioritySort.sortKeys('Event', 'name', listeners, order).map(EventFusion.fuse);
    };

    var combineEventLists = function (eventLists, eventOrder) {
      console.log('eventLists', eventLists);
      return Obj.map(eventLists, function (listeners, eventName) {
        console.log('listeners', listeners);
        var combined = listeners.length === 1 ? Result.value(listeners[0].handler()) : fuse(listeners, eventOrder, eventName);
        console.log('combine.events', combined.getOr('none'), listeners);
        return combined.map(assemble).getOrDie();
      });
    };
   
    return {
      combine: combine
    };
  }
);
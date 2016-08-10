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

    var groupByEvents = function (info, behaviours, base) {
      // FIX: behaviourEvents['lab.custom.definition.events'] = CustomDefinition.toEvents(info);
      var behaviourEvents = Merger.deepMerge(base, nameToHandlers(behaviours, info));
      
      // Now, with all of these events, we need to index by event name
      return ObjIndex.byInnerKey(behaviourEvents, behaviourHandler);
    };

    var combine = function (info, behaviours, base) {
      var byEventName = groupByEvents(info, behaviours, base);
      return combineGroups(byEventName, info.eventOrder());
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

    var missingOrderError = function (eventName, handlers) {
      return new Result.error(
        'The event (' + eventName + ') has more than one behaviour that listens to it.\nWhen this occurs, you must ' + 
        'specify an event ordering for the behaviours in your spec (e.g. [ "listing", "toggling" ]).\nThe behaviours that ' + 
        'can trigger it are: ' + Json.stringify(Arr.map(handlers, function (c) { return c.name(); }), null, 2)
      );        
    };

    var fuse = function (handlers, eventOrder, eventName) {
      var order = eventOrder[eventName];
      if (! order) return missingOrderError(eventName, handlers);
      else return PrioritySort.sortKeys('Event', 'name', handlers, order).map(EventHandler.fuse);
    };

    var combineGroups = function (byEventName, eventOrder) {
      return Obj.map(byEventName, function (handlers, eventName) {
        var combined = handlers.length === 1 ? Result.value(handlers[0].handler()) : fuse(handlers, eventOrder, eventName);
        return combined.map(assemble).getOrDie();
      });
    };
   
    return {
      combine: combine
    };
  }
);
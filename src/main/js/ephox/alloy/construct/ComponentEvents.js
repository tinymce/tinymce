define(
  'ephox.alloy.construct.ComponentEvents',

  [
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

  function (ObjIndex, PrioritySort, FieldPresence, FieldSchema, Objects, ValueSchema, Arr, Obj, Merger, Json, Fun, Result, Array, Error) {
    var behaviourListener = function (name, listener) {
      return {
        name: Fun.constant(name),
        listener: Fun.constant(listener)
      };
    };

    var handler = function (parts) {
      return ValueSchema.asRaw('Extracting handler', ValueSchema.objOf([
        FieldSchema.field('can', 'can', FieldPresence.defaulted(Fun.constant(true)), ValueSchema.anyValue()),
        FieldSchema.field('abort', 'abort', FieldPresence.defaulted(Fun.constant(false)), ValueSchema.anyValue()),
        FieldSchema.field('run', 'run', FieldPresence.defaulted(Fun.noop), ValueSchema.anyValue())
      ]), parts).getOrDie();
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
      var byEventName = ObjIndex.byInnerKey(behaviourEvents, behaviourListener);

      return combineEventLists(byEventName, info.eventOrder());
    };

    var assemble = function (listener) {
      console.log('assemble.listener', listener);
      return function (component, simulatedEvent/*, others */) {
        console.log('running.listener', listener);
        var args = Array.prototype.slice.call(arguments, 0);
        if (listener.abort.apply(undefined, args)) {
          simulatedEvent.stop();
        } else if (listener.can.apply(undefined, args)) {
          listener.run.apply(undefined, args);
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
      console.log('fuse.listeners', listeners);
      var order = eventOrder[eventName];
      if (! order) return missingOrderError(eventName, listeners);
      else return PrioritySort.sortKeys('Event', 'name', listeners, order).map(function (sorted) {
        console.log('sorted');
        var can = function () {
          var args = Array.prototype.slice.call(arguments, 0);
          return Arr.foldl(sorted, function (acc, listener) {
            return acc && listener.can.apply(undefined, args);
          }, true);
        };

        var run = function () {
          var args = Array.prototype.slice.call(arguments, 0);
          Arr.each(sorted, function (listener) {
            listener.run.apply(undefined, args);
          });
        };

        var abort = function () {
          var args = Array.prototype.slice.call(arguments, 0);
          return Arr.foldl(sorted, function (acc, listener) {
            return acc || listener.abort.apply(undefined, args);
          }, false);
        };

        return handler({
          can: can,
          abort: abort,
          run: run
        });
      });
    };

    var combineEventLists = function (eventLists, eventOrder) {
      console.log('eventLists', eventLists);
      return Obj.map(eventLists, function (listeners, eventName) {
        console.log('listeners', listeners);
        var combined = listeners.length === 1 ? Result.value(listeners[0].listener()) : fuse(listeners, eventOrder, eventName);
        console.log('combine.events', combined.getOr('none'), listeners);
        return combined.map(assemble).getOrDie();
      });
    };
   
    return {
      combine: combine,
      handler: handler
    };
  }
);
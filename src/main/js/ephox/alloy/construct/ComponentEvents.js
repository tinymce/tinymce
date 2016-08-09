define(
  'ephox.alloy.construct.ComponentEvents',

  [
    'ephox.alloy.util.PrioritySort',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.numerosity.api.JSON',
    'ephox.peanut.Fun',
    'ephox.perhaps.Result',
    'global!Array',
    'global!Error'
  ],

  function (PrioritySort, FieldPresence, FieldSchema, Objects, ValueSchema, Arr, Obj, Json, Fun, Result, Array, Error) {
    var behaviourEvent = function (name, listener) {
      return {
        name: Fun.constant(name),
        listener: listener
      };
    };

    var handler = function (parts) {
      return ValueSchema.asRaw('Extracting handler', ValueSchema.objOf([
        FieldSchema.field('can', 'can', FieldPresence.defaulted(Fun.constant(true)), ValueSchema.anyValue()),
        FieldSchema.field('abort', 'abort', FieldPresence.defaulted(Fun.constant(false)), ValueSchema.anyValue())
      ]), parts).getOrDie();
    };

    var combine = function (info, behaviours, base) {
      // FIX: behaviourEvents['lab.custom.definition.events'] = CustomDefinition.toEvents(info);
      var behaviourEvents = base;
      Arr.each(behaviours, function (behaviour) {
        behaviourEvents[behaviour.name()] = behaviour.handlers(info);        
      });

      // Now, with all of these events, we need to get a list of behaviours
      var eventChains = { };
      Obj.each(behaviourEvents, function (events, behaviourName) {
        Obj.each(events, function (listener, eventName) {
          // TODO: Has own property.
          var chain = Objects.readOr(eventName, [ ])(eventChains);
          chain = chain.concat([
            behaviourEvent(behaviourName, listener)
          ]);
          eventChains[eventName] = chain;
        });
      });

      return combineEventLists(eventChains, info.eventOrder());
    };

    var assemble = function (listener) {
      return function (component, simulatedEvent/*, others */) {
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
      var order = eventOrder[eventName];
      if (! order) return missingOrderError(eventName, listeners);
      else return PrioritySort.sortKeys('Event', 'name', listeners, order).map(function (sorted) {
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
      return Obj.map(eventLists, function (listeners, eventName) {
        var combined = listeners.length === 1 ? Result.value(listeners[0]) : fuse(listeners, eventOrder, eventName);
        return combined.map(assemble);
      });
    };
   
    return {
      combine: combine,
      handler: handler
    };
  }
);
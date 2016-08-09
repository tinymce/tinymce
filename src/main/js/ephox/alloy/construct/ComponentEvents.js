define(
  'ephox.alloy.construct.ComponentEvents',

  [

  ],

  function () {
    var combine = function (info, behaviours, base) {

    };
        // Dupe with combineApi
    var combineEvents = function (info, behaviours, base) {
      // Get the APIs sorted by behaviour
      var behaviourEvents = { };
      Arr.each(behaviours, function (behaviour) {
        behaviourEvents[behaviour.name()] = behaviour.handlers(info);        
      });
      behaviourEvents['lab.custom.definition.events'] = CustomDefinition.toEvents(info);

      // Now, with all of these events, we need to get a list of behaviours
      var eventChains = { };
      Obj.each(behaviourEvents, function (events, behaviourName) {
        Obj.each(events, function (eventF, eventName) {
          // TODO: Has own property.
          var chain = Objects.readOr(eventName, [ ])(eventChains);
          chain = chain.concat({ b: behaviourName, h: eventF });
          eventChains[eventName] = chain;
        });
      });

      console.log('eventChains', eventChains);

      // TODO: Add something to boulder to merge in some defaults.
      var eventOrder =  info.eventOrder();

      // Now, with this API chain list, we need to combine things. Sort them in order.
      return Obj.map(eventChains, function (chain, eventName) {
        if (chain.length > 1) {
          var order = eventOrder[eventName];
          if (! order) throw new Error(
            'The event (' + eventName + ') has more than one behaviour that listens to it.\nWhen this occurs, you must ' + 
            'specify an event ordering for the behaviours in your spec (e.g. [ "listing", "toggling" ]).\nThe behaviours that ' + 
            'can trigger it are: ' + Json.stringify(Arr.map(chain, function (c) { return c.b; }), null, 2)
          );        
          var sorted = chain.slice(0).sort(function (a, b) {
            var aIndex = order.indexOf(a.b);
            var bIndex = order.indexOf(b.b);
            if (aIndex === -1) throw new Error('The Event ordering for ' + eventName + ' does not have an entry for ' + a.b);
            if (bIndex === -1) throw new Error('The Event ordering for ' + eventName + ' does not have an entry for ' + b.b);
            if (aIndex < bIndex) return -1;
            else if (bIndex < aIndex) return 1;
            else return 0;
          });

          var can = function () {
            var args = Array.prototype.slice.call(arguments, 0);
            return Arr.foldl(sorted, function (acc, b) {
              var bCan = b.h.can !== undefined ? b.h.can : Fun.constant(true);
              return acc && bCan.apply(undefined, args);
            }, true);
          };

          var run = function () {
            var args = Array.prototype.slice.call(arguments, 0);
            Arr.each(sorted, function (s) {
              var sRun = s.h.run !== undefined ? s.h.run : Fun.noop;
              sRun.apply(undefined, args);
            });
          };

          var abort = function () {
            var args = Array.prototype.slice.call(arguments, 0);
            return Arr.foldl(sorted, function (acc, b) {
              var bAbort = b.h.abort !== undefined ? b.h.abort : Fun.constant(false);
              return acc || bAbort.apply(undefined, args);
            }, false);
          };

          var label = Arr.map(sorted, function (c) {
            return c.b;
          }).join(' -> ');


          return {
            label: label,
            can: can,
            run: run,
            abort: abort
          };
        } else {
          return {
            can: chain[0].h.can !== undefined ? chain[0].h.can : Fun.constant(true),
            run: chain[0].h.run !== undefined ? chain[0].h.run : Fun.noop,
            abort: chain[0].h.abort !== undefined ? chain[0].h.abort : Fun.constant(false)
          };
        }
      });
    };
    return null;
  }
);
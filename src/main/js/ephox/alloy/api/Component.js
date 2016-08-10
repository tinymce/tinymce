define(
  'ephox.alloy.api.Component',

  [
    'ephox.alloy.api.NoContextApi',
    'ephox.scullion.Cell'
  ],

  function (NoContextApi, Cell) {
    var build = function (spec) {
      var systemApi = Cell(NoContextApi());

      var info = CustomDefinition.toInfo(spec);
      var behaviours = CustomDefinition.behaviours(info);

      var definition = CustomDefinition.toDefinition(info);
      var item = LabRender.renderToDom(definition);

      var rawEvents = combineEvents(info, behaviours);

      var events = Obj.map(rawEvents, function (eventInfo, eventType) {
        if (eventInfo.can === undefined && eventInfo.run === undefined) throw new Error('Event type: ' + eventType + ' missing both "can" and "run"');
        return function (labby, labevent/*, ... */) {

          var args = Array.prototype.slice.call(arguments, 0);
          var eventCan = eventInfo.can !== undefined ? eventInfo.can : Fun.constant(true);
          var eventRun = eventInfo.run !== undefined ? eventInfo.run : Fun.noop;
          var eventAbort = eventInfo.abort !== undefined ? eventInfo.abort: Fun.constant(false);

          if (eventAbort.apply(undefined, args)) {
            labevent.stop();
          } else if (eventCan.apply(undefined, args)) {
            eventRun.apply(undefined, args);
          }
        };
      });

      console.log('events', events);
      var apis = combineApis(info, behaviours);

      var connect = function (newApi) {
        systemApi.set(newApi);
      };

      var debugSystem = function () {
        return systemApi.get().debugLabel();
      };

      return Merger.deepMerge({
        getSystem: systemApi.get,
        debugSystem: debugSystem,
        connect: connect,
        label: Fun.constant(info.label()),
        element: Fun.constant(item),
        // Note: this is only the original components.
        components: Fun.constant(info.components()),
        item: Fun.constant(item),
        events: Fun.constant(events)
      }, {
        apis: Fun.constant(apis)
      });
    };

    return {
      build: build
    };
    return null;
  }
);
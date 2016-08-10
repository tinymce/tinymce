define(
  'ephox.alloy.api.Component',

  [
    'ephox.alloy.api.NoContextApi',
    'ephox.alloy.construct.ComponentApis',
    'ephox.alloy.construct.ComponentEvents',
    'ephox.alloy.construct.CustomDefinition',
    'ephox.alloy.dom.DomRender',
    'ephox.alloy.util.ExtraArgs',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.scullion.Cell'
  ],

  function (NoContextApi, ComponentApis, ComponentEvents, CustomDefinition, DomRender, ExtraArgs, Merger, Fun, Cell) {
    var build = function (spec) {
      var systemApi = Cell(NoContextApi());

      var info = CustomDefinition.toInfo(spec).getOrDie();
      console.log('component.info', info);
      var behaviours = CustomDefinition.behaviours(info);

      var definition = CustomDefinition.toDefinition(info);
      var item = DomRender.renderToDom(definition);

      var baseEvents = {
        'alloy.base.behaviour': CustomDefinition.toEvents(info)
      };

      var events = ComponentEvents.combine(info, behaviours, baseEvents);
      
      // Curry a lazy argument into the API. Invoke it before calling.
      var apis = ComponentApis.combine(info, behaviours, [
        ExtraArgs.lazy(function () { return self; })
      ]);

      var connect = function (newApi) {
        systemApi.set(newApi);
      };

      var debugSystem = function () {
        return systemApi.get().debugLabel();
      };

      var self = {
        getSystem: systemApi.get,
        debugSystem: debugSystem,
        connect: connect,
        label: Fun.constant(info.label()),
        element: Fun.constant(item),
        // Note: this is only the original components.
        components: Fun.constant(info.components()),
        item: Fun.constant(item),
        events: Fun.constant(events),
        apis: Fun.constant(apis)
      };

      return self;
    };

    return {
      build: build
    };
  }
);
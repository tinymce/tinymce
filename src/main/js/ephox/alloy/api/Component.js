define(
  'ephox.alloy.api.Component',

  [
    'ephox.alloy.alien.ExtraArgs',
    'ephox.alloy.api.NoContextApi',
    'ephox.alloy.construct.ComponentApis',
    'ephox.alloy.construct.ComponentDom',
    'ephox.alloy.construct.ComponentEvents',
    'ephox.alloy.construct.CustomDefinition',
    'ephox.alloy.dom.DomModification',
    'ephox.alloy.dom.DomRender',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.scullion.Cell'
  ],

  function (ExtraArgs, NoContextApi, ComponentApis, ComponentDom, ComponentEvents, CustomDefinition, DomModification, DomRender, ValueSchema, Fun, Option, Cell) {
    var build = function (spec) { 
      var getSelf = function () {
        return self;
      };

      var systemApi = Cell(NoContextApi(getSelf));

      var info = ValueSchema.getOrDie(CustomDefinition.toInfo(spec));
      var behaviours = CustomDefinition.behaviours(info);

      var definition = CustomDefinition.toDefinition(info);
      
      var modification = ComponentDom.combine(info, behaviours, definition).getOrDie();
      var modDefinition = DomModification.merge(definition, modification);

      var item = DomRender.renderToDom(modDefinition);

      var baseEvents = {
        'alloy.base.behaviour': CustomDefinition.toEvents(info)
      };

      var baseApis = {
        'alloy.base.apis': CustomDefinition.toApis(info)
      };

      var events = ComponentEvents.combine(info, behaviours, baseEvents).getOrDie();

      // Curry a lazy argument into the API. Invoke it before calling.
      var apis = ComponentApis.combine(info, behaviours, baseApis, [
        // Use the delegate if there is one.
        ExtraArgs.lazy(function () {
          return self;
        })
      ]).getOrDie();
   

      var connect = function (newApi) {
        systemApi.set(newApi);
      };

      var disconnect = function () {
        systemApi.set(NoContextApi(getSelf));
      };

      var debugSystem = function () {
        return systemApi.get().debugLabel();
      };

      var self = {
        getSystem: systemApi.get,
        debugSystem: debugSystem,
        delegate: info.delegate,
        connect: connect,
        disconnect: disconnect,
        element: Fun.constant(item),
        // Note: this is only the original components.
        components: Fun.constant(info.components()),
        item: Fun.constant(item),
        events: Fun.constant(events),
        apis: Fun.constant(apis),

        logSpec: function () {
          console.log('debugging :: component spec', spec);
        },
        logInfo: function () {
          console.log('debugging :: component.info', info);
        }
      };

      return self;
    };

    return {
      build: build
    };
  }
);
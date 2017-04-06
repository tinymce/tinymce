define(
  'ephox.alloy.api.component.Component',

  [
    'ephox.alloy.api.system.NoContextApi',
    'ephox.alloy.api.ui.GuiTypes',
    'ephox.alloy.construct.ComponentDom',
    'ephox.alloy.construct.ComponentEvents',
    'ephox.alloy.construct.CustomDefinition',
    'ephox.alloy.dom.DomModification',
    'ephox.alloy.dom.DomRender',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Type',
    'ephox.katamari.api.Arr',
    'ephox.sand.api.JSON',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Cell',
    'ephox.sugar.api.search.Traverse',
    'global!Error'
  ],

  function (NoContextApi, GuiTypes, ComponentDom, ComponentEvents, CustomDefinition, DomModification, DomRender, ValueSchema, Type, Arr, Json, Fun, Cell, Traverse, Error) {
    var build = function (spec) { 
       var getSelf = function () {
        return self;
      };

      var systemApi = Cell(NoContextApi(getSelf));


      var info = ValueSchema.getOrDie(CustomDefinition.toInfo(spec));

      // The behaviour configuration is put into info.behaviours(). For everything else,
      // we just need the list of static behaviours that this component cares about. The behaviour info
      // to pass through will come from the info.behaviours() obj.
      var behaviours = CustomDefinition.behaviours(info);

      var definition = CustomDefinition.toDefinition(info);

      var baseModification = {
        'alloy.base.modification': CustomDefinition.toModification(info)
      };
      
      var modification = ComponentDom.combine(info, baseModification, behaviours, definition).getOrDie();

      var modDefinition = DomModification.merge(definition, modification);

      var item = DomRender.renderToDom(modDefinition);

      var baseEvents = {
        'alloy.base.behaviour': CustomDefinition.toEvents(info)
      };

      var events = ComponentEvents.combine(info, behaviours, baseEvents).getOrDie();

      var subcomponents = Cell(info.components());

      var connect = function (newApi) {
        systemApi.set(newApi);
      };

      var disconnect = function () {
        systemApi.set(NoContextApi(getSelf));
      };

      var debugSystem = function () {
        return systemApi.get().debugLabel();
      };

      var syncComponents = function () {
        // Update the component list with the current children
        var children = Traverse.children(item);
        var subs = Arr.bind(children, function (child) {
          
          return systemApi.get().getByDom(child).fold(function () {
            // INVESTIGATE: Not sure about how to handle text nodes here.
            return [ ];
          }, function (c) {
            return [ c ];
          });
        });
        subcomponents.set(subs);
      };

      var config = function (behaviour) {
        if (behaviour === GuiTypes.apiConfig()) return info.apis();
        return info.behaviours().bind(function (b) {
          var f = Type.isFunction(b[behaviour.name()]) ? b[behaviour.name()] : function () {            
            throw new Error('Could not find ' + behaviour.name() + ' in ' + Json.stringify(spec, null, 2));
          };
          return f();
        });
      };

      var self = {
        getSystem: systemApi.get,
        debugSystem: debugSystem,

        config: config,
        spec: Fun.constant(spec),

        connect: connect,
        disconnect: disconnect,
        element: Fun.constant(item),
        syncComponents: syncComponents,
        components: subcomponents.get,
        item: Fun.constant(item),
        events: Fun.constant(events),
        // apis: Fun.constant(apis),

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
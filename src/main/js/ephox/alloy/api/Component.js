define(
  'ephox.alloy.api.Component',

  [
    'ephox.alloy.alien.ExtraArgs',
    'ephox.alloy.api.NoContextApi',
    'ephox.alloy.api.behaviour.BehaviourExport',
    'ephox.alloy.construct.ComponentApis',
    'ephox.alloy.construct.ComponentDom',
    'ephox.alloy.construct.ComponentEvents',
    'ephox.alloy.construct.CustomDefinition',
    'ephox.alloy.dom.DomModification',
    'ephox.alloy.dom.DomRender',
    'ephox.boulder.api.ValueSchema',
    'ephox.classify.Type',
    'ephox.compass.Arr',
    'ephox.numerosity.api.JSON',
    'ephox.peanut.Fun',
    'ephox.scullion.Cell',
    'ephox.sugar.api.Traverse',
    'global!Error'
  ],

  function (ExtraArgs, NoContextApi, BehaviourExport, ComponentApis, ComponentDom, ComponentEvents, CustomDefinition, DomModification, DomRender, ValueSchema, Type, Arr, Json, Fun, Cell, Traverse, Error) {
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
      
      var modification = ComponentDom.combine(info, behaviours, definition).getOrDie();

      var modDefinition = DomModification.merge(definition, modification);

      var item = DomRender.renderToDom(modDefinition);

      var baseEvents = {
        'alloy.base.behaviour': CustomDefinition.toEvents(info)
      };

      // var baseApis = {
      //   'alloy.base.apis': CustomDefinition.toApis(info)
      // };

      var events = ComponentEvents.combine(info, behaviours, baseEvents).getOrDie();


      // // Curry a lazy argument into the API. Invoke it before calling.
      // var apis = ComponentApis.combine(info, behaviours, baseApis, [
      //   // Use the delegate if there is one.
      //   ExtraArgs.lazy(function () {
      //     return self;
      //   })
      // ]).getOrDie();
   

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
          // FIX: Not sure about how to handle text nodes here.
          return systemApi.get().getByDom(child).fold(function () {
            console.warn('Did not find: ', child.dom());
            return [ ];
          }, function (c) {
            return [ c ];
          });
        });
        subcomponents.set(subs);
      };

      var config = function (behaviour) {
        if (behaviour === BehaviourExport.all()) return info;
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

        delegate: info.delegate,
        connect: connect,
        disconnect: disconnect,
        element: Fun.constant(item),
        syncComponents: syncComponents,
        // Note: this is only the original components.
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
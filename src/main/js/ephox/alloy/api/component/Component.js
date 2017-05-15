define(
  'ephox.alloy.api.component.Component',

  [
    'ephox.alloy.api.component.CompBehaviours',
    'ephox.alloy.api.component.ComponentApi',
    'ephox.alloy.api.system.NoContextApi',
    'ephox.alloy.api.ui.GuiTypes',
    'ephox.alloy.behaviour.common.BehaviourBlob',
    'ephox.alloy.construct.ComponentDom',
    'ephox.alloy.construct.ComponentEvents',
    'ephox.alloy.construct.CustomDefinition',
    'ephox.alloy.dom.DomModification',
    'ephox.alloy.dom.DomRender',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Merger',
    'ephox.katamari.api.Type',
    'ephox.sand.api.JSON',
    'ephox.sugar.api.search.Traverse',
    'global!Error'
  ],

  function (
    CompBehaviours, ComponentApi, NoContextApi, GuiTypes, BehaviourBlob, ComponentDom, ComponentEvents, CustomDefinition, DomModification, DomRender, ValueSchema,
    Arr, Cell, Fun, Merger, Type, Json, Traverse, Error
  ) {
    var build = function (spec) {
      var getMe = function () {
        return me;
      };

      var systemApi = Cell(NoContextApi(getMe));


      var info = ValueSchema.getOrDie(CustomDefinition.toInfo(Merger.deepMerge(
        spec,
        {behaviours: undefined}
      )));

      // The behaviour configuration is put into info.behaviours(). For everything else,
      // we just need the list of static behaviours that this component cares about. The behaviour info
      // to pass through will come from the info.behaviours() obj.
      var bBlob = CompBehaviours.generate(spec);
      var bList = BehaviourBlob.getBehaviours(bBlob);
      var bData = BehaviourBlob.getData(bBlob);

      var definition = CustomDefinition.toDefinition(info);

      var baseModification = {
        'alloy.base.modification': CustomDefinition.toModification(info)
      };

      var modification = ComponentDom.combine(bData, baseModification, bList, definition).getOrDie();

      var modDefinition = DomModification.merge(definition, modification);

      var item = DomRender.renderToDom(modDefinition);

      var baseEvents = {
        'alloy.base.behaviour': CustomDefinition.toEvents(info)
      };

      var events = ComponentEvents.combine(bData, info.eventOrder(), bList, baseEvents).getOrDie();

      var subcomponents = Cell(info.components());

      var connect = function (newApi) {
        systemApi.set(newApi);
      };

      var disconnect = function () {
        systemApi.set(NoContextApi(getMe));
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
        var b = bData;
        var f = Type.isFunction(b[behaviour.name()]) ? b[behaviour.name()] : function () {
          throw new Error('Could not find ' + behaviour.name() + ' in ' + Json.stringify(spec, null, 2));
        };
        return f();
        // });
      };

      var readState = function (behaviourName) {
        return bData[behaviourName]().map(function (b) {
          return b.state.readState();
        }).getOr('not enabled');
      };

      var me = ComponentApi({
        getSystem: systemApi.get,
        config: config,
        spec: Fun.constant(spec),
        readState: readState,

        connect: connect,
        disconnect: disconnect,
        element: Fun.constant(item),
        syncComponents: syncComponents,
        components: subcomponents.get,
        events: Fun.constant(events)
      });

      return me;
    };

    return {
      build: build
    };
  }
);
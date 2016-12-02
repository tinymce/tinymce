define(
  'ephox.alloy.construct.CustomDefinition',

  [
    'ephox.alloy.api.behaviour.Coupling',
    'ephox.alloy.api.behaviour.Disabling',
    'ephox.alloy.api.behaviour.Docking',
    'ephox.alloy.api.behaviour.Dragging',
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.behaviour.Highlighting',
    'ephox.alloy.api.behaviour.Invalidating',
    'ephox.alloy.api.behaviour.Receiving',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.dom.DomDefinition',
    'ephox.alloy.ephemera.AlloyTags',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'global!Error'
  ],

  function (Coupling, Disabling, Docking, Dragging, Focusing, Highlighting, Invalidating, Receiving, Toggling, DomDefinition, AlloyTags, FieldPresence, FieldSchema, Objects, ValueSchema, Arr, Merger, Fun, Error) {
    var toInfo = function (spec) {
      var behaviours = Objects.readOr('customBehaviours', [])(spec);
      var bs = getDefaultBehaviours(spec);
      var behaviourSchema = Arr.map(bs.concat(behaviours), function (b) {
        return b.schema();
      });

      console.log('behaviourSchema', behaviourSchema);
      if (behaviourSchema.length > 2) {
        console.log('spec', spec);
        debugger;
      }

      
      // var behaviourSchema = [ Positioning.schema(), Focusing.schema(), Unselecting.schema(), Keying.schema(), Tabstopping.schema(), Transitioning.schema(), Receiving.schema() ];

      return ValueSchema.asStruct('custom.definition', ValueSchema.objOf([
        FieldSchema.strictObjOf('dom', [
          // Note, no children.
          FieldSchema.strict('tag'),
          FieldSchema.defaulted('styles', {}),
          FieldSchema.defaulted('classes', []),
          FieldSchema.defaulted('attributes', {}),
          FieldSchema.option('value'),
          FieldSchema.option('innerHtml')
        ]),
        FieldSchema.strict('components'),
        FieldSchema.strict('uid'),

        FieldSchema.optionObjOf('behaviours', behaviourSchema),

        // FieldSchema.state('behaviours', function (s) {
        //   return Objects.hasKey(s, 'behaviours') ? s.behaviours : { };
        // }),
        // FieldSchema.defaulted('behaviours', [ ]),

        // TODO: Add behaviours here.
        //

        FieldSchema.defaulted('events', {}),
        FieldSchema.defaulted('apis', Fun.constant({})),

        // Use mergeWith in the future when pre-built behaviours conflict
        FieldSchema.defaulted('apiOrder', {}),
        FieldSchema.field(
          'eventOrder',
          'eventOrder',
          FieldPresence.mergeWith({
            'alloy.execute': [ 'disabling', 'alloy.base.behaviour', 'toggling' ],
            'alloy.focus': [ 'alloy.base.behaviour', 'keying', 'focusing' ],
            'alloy.system.init': [ 'alloy.base.behaviour', 'disabling', 'toggling' ]
          }),
          ValueSchema.anyValue()
        ),
        FieldSchema.defaulted('domModificationOrder', {}),

        FieldSchema.state('definition.input', Fun.identity),
        FieldSchema.defaulted('postprocess', Fun.noop),

        // Could wrap this up in a behaviour ...but won't for the time being
        FieldSchema.optionObjOf('delegate', [
          FieldSchema.strict('get')
        ]),
        FieldSchema.state('originalSpec', Fun.identity)
      ]), spec);
    };

    var getUid = function (info) {
      return Objects.wrap(AlloyTags.idAttr(), info.uid());
    };

    var toDefinition = function (info) {
      var base = {
        tag: info.dom().tag(),
        classes: info.dom().classes(),
        attributes: Merger.deepMerge(
          getUid(info),
          { role: 'presentation' },
          info.dom().attributes()
        ),
        styles: info.dom().styles(),
        domChildren: Arr.map(info.components(), function (comp) { return comp.element(); })
      };

      return DomDefinition.nu(Merger.deepMerge(base, 
        info.dom().innerHtml().map(function (h) { return Objects.wrap('innerHtml', h); }).getOr({ }),
        info.dom().value().map(function (h) { return Objects.wrap('value', h); }).getOr({ })
      ));
    };

    var getDefaultBehaviours = function (spec) {
      return Arr.filter(alloyBehaviours, function (b) {
        return Objects.hasKey(spec, 'behaviours') && Objects.hasKey(spec.behaviours, b.name());
      });
    };

    var alloyBehaviours = [
      Toggling,
      Coupling,
      Disabling,
      Docking,
      Dragging,
      Focusing,
      Highlighting,
      Invalidating,
      Receiving
      // Toggling,
      // Keying,
      // Tabstopping,
      // Focusing,
      // Receiving,
      // Coupling,
      // Streaming,
      // Positioning,
      // Highlighting,
      // Sandboxing,
      // Redesigning,
      // Disabling,
      // Invalidating,
      // Replacing,
      // Representing,
      // Sliding,
      // Transitioning,
      // Dragging,
      // Docking,
      // Unselecting,
      // Remembering
    ];

    var behaviours = function (info) {
      var spec = info.originalSpec();
      var custom = Objects.readOptFrom(spec, 'customBehaviours').getOr([ ]);
      var alloy = getDefaultBehaviours(spec);
      return custom.concat(alloy);
    };

    // Probably want to pass info to these at some point.
    var toApis = function (info) {
      return info.apis();
    };

    var toEvents = function (info) {
      return info.events();
    };

    return {
      toInfo: toInfo,
      toDefinition: toDefinition,
      behaviours: behaviours,
      toApis: toApis,
      toEvents: toEvents
    };
  }
);
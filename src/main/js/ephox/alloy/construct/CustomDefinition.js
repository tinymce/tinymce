define(
  'ephox.alloy.construct.CustomDefinition',

  [
    'ephox.alloy.api.behaviour.Composing',
    'ephox.alloy.api.behaviour.Coupling',
    'ephox.alloy.api.behaviour.Disabling',
    'ephox.alloy.api.behaviour.Docking',
    'ephox.alloy.api.behaviour.Dragging',
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.behaviour.Highlighting',
    'ephox.alloy.api.behaviour.Invalidating',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Positioning',
    'ephox.alloy.api.behaviour.Receiving',
    'ephox.alloy.api.behaviour.Replacing',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.behaviour.Sandboxing',
    'ephox.alloy.api.behaviour.Sliding',
    'ephox.alloy.api.behaviour.Streaming',
    'ephox.alloy.api.behaviour.Tabstopping',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.behaviour.Unselecting',
    'ephox.alloy.dom.DomDefinition',
    'ephox.alloy.dom.DomModification',
    'ephox.alloy.ephemera.AlloyTags',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Merger',
    'ephox.katamari.api.Fun',
    'global!Error'
  ],

  function (
    Composing, Coupling, Disabling, Docking, Dragging, Focusing, Highlighting, Invalidating, Keying, Positioning, Receiving, Replacing, Representing, Sandboxing,
    Sliding, Streaming, Tabstopping, Toggling, Unselecting, DomDefinition, DomModification, AlloyTags, FieldPresence, FieldSchema, Objects, ValueSchema, Arr,
    Merger, Fun, Error
  ) {
    var toInfo = function (spec) {
      var behaviours = Objects.readOr('customBehaviours', [])(spec);
      var bs = getDefaultBehaviours(spec);
      var behaviourSchema = Arr.map(bs.concat(behaviours), function (b) {
        return b.schema();
      });

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

        FieldSchema.defaulted('events', {}),
        FieldSchema.defaulted('apis', Fun.constant({})),

        // Use mergeWith in the future when pre-built behaviours conflict
        FieldSchema.field(
          'eventOrder',
          'eventOrder',
          FieldPresence.mergeWith({
            'alloy.execute': [ 'disabling', 'alloy.base.behaviour', 'toggling' ],
            'alloy.focus': [ 'alloy.base.behaviour', 'keying', 'focusing' ],
            'alloy.system.init': [ 'alloy.base.behaviour', 'disabling', 'toggling', 'representing' ],
            'input': [ 'alloy.base.behaviour', 'representing', 'streaming', 'invalidating' ]
          }),
          ValueSchema.anyValue()
        ),

        FieldSchema.option('domModification'),

        FieldSchema.state('definition.input', Fun.identity),

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

    var toModification = function (info) {
      return info.domModification().fold(function () {
        return DomModification.nu({ });
      }, DomModification.nu);
    };

    var getDefaultBehaviours = function (spec) {
      return Arr.filter(alloyBehaviours, function (b) {
        return Objects.hasKey(spec, 'behaviours') && Objects.hasKey(spec.behaviours, b.name());
      });
    };

    var alloyBehaviours = [
      Toggling,
      Composing,
      Coupling,
      Disabling,
      Docking,
      Dragging,
      Focusing,
      Highlighting,
      Invalidating,
      Keying,
      Positioning,
      Receiving,
      Replacing,
      Representing,
      Sandboxing,
      Sliding,
      Streaming,
      Tabstopping,
      Unselecting
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
      toModification: toModification,
      behaviours: behaviours,
      toApis: toApis,
      toEvents: toEvents
    };
  }
);
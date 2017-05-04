define(
  'ephox.alloy.construct.CustomDefinition',

  [
    'ephox.alloy.data.Fields',
    'ephox.alloy.dom.DomDefinition',
    'ephox.alloy.dom.DomModification',
    'ephox.alloy.ephemera.AlloyTags',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Merger',
    'global!Error'
  ],

  function (Fields, DomDefinition, DomModification, AlloyTags, FieldPresence, FieldSchema, Objects, ValueSchema, Arr, Fun, Merger, Error) {

    var toInfo = function (spec) {
      return ValueSchema.asStruct('custom.definition', ValueSchema.objOfOnly([
        FieldSchema.field('dom', 'dom', FieldPresence.strict(), ValueSchema.objOfOnly([
          // Note, no children.
          FieldSchema.strict('tag'),
          FieldSchema.defaulted('styles', {}),
          FieldSchema.defaulted('classes', []),
          FieldSchema.defaulted('attributes', {}),
          FieldSchema.option('value'),
          FieldSchema.option('innerHtml')
        ])),
        FieldSchema.strict('components'),
        FieldSchema.strict('uid'),

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
            'input': [ 'alloy.base.behaviour', 'representing', 'streaming', 'invalidating' ],
            'alloy.system.detached': [ 'alloy.base.behaviour', 'representing' ]
          }),
          ValueSchema.anyValue()
        ),

        FieldSchema.option('domModification'),
        Fields.snapshot('originalSpec'),

        // Need to have this initially
        FieldSchema.defaulted('customBehaviours', [ ]),

        FieldSchema.defaulted('debug.sketcher', 'unknown')
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
      toApis: toApis,
      toEvents: toEvents
    };
  }
);
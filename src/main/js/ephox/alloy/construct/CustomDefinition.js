define(
  'ephox.alloy.construct.CustomDefinition',

  [
    'ephox.alloy.dom.DomDefinition',
    'ephox.alloy.dom.DomModification',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'global!Error'
  ],

  function (DomDefinition, DomModification, FieldPresence, FieldSchema, Objects, ValueSchema, Arr, Fun, Error) {
    var domSchema = ValueSchema.objOf([
      FieldSchema.strict('tag'),
      FieldSchema.defaulted('styles', {}),
      FieldSchema.defaulted('classes', []),
      FieldSchema.defaulted('attributes', {}),
      FieldSchema.field('value', 'value', FieldPresence.asOption(), ValueSchema.anyValue()),
      FieldSchema.field('innerHtml', 'innerHtml', FieldPresence.asOption(), ValueSchema.anyValue())
      // Note, no children.
    ]);

    var toInfo = function (spec) {
      var behaviours = Objects.readOr('behaviours', [])(spec);
      var behaviourSchema = Arr.map(behaviours, function (b) {
        return b.schema();
      });

      return ValueSchema.asStruct('custom.definition', ValueSchema.objOf([
        FieldSchema.field('dom', 'dom', FieldPresence.strict(), domSchema),
        FieldSchema.strict('components'),
        FieldSchema.defaulted('label', 'Unlabelled'),
        FieldSchema.defaulted('behaviours', [ ]),

        // TODO: Add behaviours here.
        //

        FieldSchema.defaulted('events', {}),

        // Use mergeWith in the future when pre-built behaviours conflict
        FieldSchema.defaulted('apiOrder', {}),
        FieldSchema.defaulted('eventOrder', {}),

        FieldSchema.state('definition.input', Fun.identity)
      ].concat(behaviourSchema)), spec);
    };

    var toDefinition = function (info) {
      var base = {
        tag: info.dom().tag(),
        classes: info.dom().classes(),
        attributes: info.dom().attributes(),
        styles: info.dom().styles(),
        children: Arr.map(info.components(), function (comp) { return comp.element(); })
      };

      info.dom().innerHtml().each(function (html) {
        base.innerHtml = html;
      });

      info.dom().value().each(function (value) {
        base.value = value;
      });

      var bs = behaviours(info);
      return Arr.foldl(bs, function (acc, b) {
        var modification = b.exhibit(info);
        return DomModification.merge(acc, modification);
        // var mod = behaviour.exhibit(info, );
        // return modify(d, mod);
      }, DomDefinition.nu(base));
    };

    // No implemented behaviours in alloy yet
    var alloyBehaviours = [ ];

    var behaviours = function (info) {
      // TODO: Check if behaviours are duplicated? Lab used to ...
      var bs = info.behaviours();
      return alloyBehaviours.concat(bs);
    };

    var toEvents = function (info) {
      return info.events();
    };

    return {
      toInfo: toInfo,
      toDefinition: toDefinition,
      behaviours: behaviours,
      toEvents: toEvents
    };
  }
);
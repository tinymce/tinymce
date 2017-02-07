define(
  'ephox.alloy.api.ui.Form',

  [
    'ephox.alloy.api.behaviour.Composing',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.ui.UiSketcher',
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.compass.Obj',
    'ephox.highway.Merger',
    'ephox.perhaps.Option'
  ],

  function (Composing, Representing, UiSketcher, SpecSchema, UiSubstitutes, Obj, Merger, Option) {
    var schema = [
      
    ];

    var sketch = function (rawSpec) {
      var spec = UiSketcher.supplyUid(rawSpec);
      var detail = SpecSchema.asStructOrDie('form', schema, spec, Obj.keys(rawSpec.parts));

      var placeholders = Obj.tupleMap(spec.parts !== undefined ? spec.parts : {}, function (partSpec, partName) {
        return {
          k: '<alloy.field.' + partName + '>',
          v: UiSubstitutes.single(true, function () {
            var partUid = detail.partUids()[partName];
            return Merger.deepMerge(
              partSpec,
              {
                uid: partUid
              }
            );
          })
        };
      });

      var components = UiSubstitutes.substitutePlaces(
        Option.some('form'),
        detail,
        detail.components(),
        placeholders
      );

    
      return make(detail, components, spec);
    };

    var make = function (detail, components, spec) {
      return Merger.deepMerge(
        spec,
        {
          'debug.sketcher': 'Form',
          uid: detail.uid(),
          dom: detail.dom(),
          components: components,

          behaviours: {
            representing: {
              store: {
                mode: 'manual',
                getValue: function (form) {
                  var partUids = detail.partUids();
                  return Obj.map(partUids, function (pUid, pName) {
                    return form.getSystem().getByUid(pUid).fold(Option.none, Option.some).bind(Composing.getCurrent).map(Representing.getValue);
                  });
                },
                setValue: function (form, values) {
                  Obj.each(values, function (newValue, key) {
                    // TODO: Make this cleaner. Maybe make the whole thing need to be specified.
                    // This should ignore things that it cannot find which helps with dynamic forms but may be undesirable
                    var part = form.getSystem().getByUid(detail.partUids()[key]).fold(Option.none, Option.some).bind(Composing.getCurrent);
                    part.each(function (current) {
                      Representing.setValue(current, newValue);
                    });
                  });
                }
              }
            }
          }
        }
      );

    };


    var parts = function (partName) {
      // FIX: Breaking abstraction
      return {
        uiType: UiSubstitutes.placeholder(),
        owner: 'form',
        name: '<alloy.field.' + partName + '>'
      };
    };

    return {
      sketch: sketch,
      parts: parts
    };
  }
);
define(
  'ephox.alloy.spec.FormSpec',

  [
    'ephox.alloy.form.FormUis',
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Obj',
    'ephox.highway.Merger',
    'ephox.perhaps.Option'
  ],

  function (FormUis, SpecSchema, UiSubstitutes, FieldPresence, FieldSchema, ValueSchema, Obj, Merger, Option) {
    var schema = [
      FieldSchema.strict('dom'),
      
      FieldSchema.field(
        'members',
        'members',
        FieldPresence.strict(),
        ValueSchema.objOf([
          FieldSchema.strict('ui')
        ])
      )
    ];

    var make = function (spec) {
      var detail = SpecSchema.asStructOrDie('Form', schema, spec, Obj.keys(spec.parts));

      var placeholders = Obj.tupleMap(spec.parts, function (partSpec, partName) {
        var partUid = detail.partUids()[partName];
        var fullSpec = detail.members().ui().munge(
          Merger.deepMerge(
            partSpec,
            {
              uid: partUid
            }
          )
        );

        var itemInfo = ValueSchema.asStructOrDie('ui.spec item', FormUis.schema(), fullSpec);
        var output = itemInfo.builder()(itemInfo, detail.members().ui().munge);
        return {
          k: '<alloy.field.' + partName + '>',
          v: UiSubstitutes.single(
            output
          )
        };
      });

      var components = UiSubstitutes.substitutePlaces(
        Option.some('form'),
        detail,
        detail.components(),
        placeholders,
        { }
      );

      return Merger.deepMerge(spec, {
        uiType: 'container',
        uid: detail.uid(),
        dom: detail.dom(),
        components: components,
        representing: {
          query: function (form) {
            var r = {};
            Obj.each(detail.partUids(), function (partUid, name) {
              form.getSystem().getByUid(partUid).each(function (field) {
                r[name] = field.delegate().map(function (dlg) {
                  return dlg.get()(field);
                }).getOr(field).apis().getValue();
              });
            });
            return r;
          },
          set: function (form, value) {
            Obj.each(value, function (v, k) {
              var fieldUid = detail.partUids()[k];
              form.getSystem().getByUid(fieldUid).each(function (field) {
                field.delegate().map(function (dlg) {
                  return dlg.get()(field);
                }).getOr(field).apis().setValue(v);
              });
            });
          }
        }
      });
    };

    return {
      make: make
    };
  }
);
define(
  'ephox.alloy.spec.FormSpec',

  [
    'ephox.alloy.form.FormScaffoldSpec',
    'ephox.alloy.form.RadioGroupSpec',
    'ephox.alloy.form.TextInputSpec',
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.highway.Merger',
    'ephox.perhaps.Option'
  ],

  function (FormScaffoldSpec, RadioGroupSpec, TextInputSpec, Tagger, SpecSchema, UiSubstitutes, FieldPresence, FieldSchema, Objects, ValueSchema, Arr, Obj, Merger, Option) {
    var schema = [
      FieldSchema.strict('dom'),
      FieldSchema.strict('uis'),

      FieldSchema.field(
        'members',
        'members',
        FieldPresence.strict(),
        ValueSchema.objOf([
          FieldSchema.strict('ui')
        ])
      )
    ];

    var uiSchema = ValueSchema.choose(
      'type',
      {
        'text-input': TextInputSpec,
        'radio-group': RadioGroupSpec,
        'form-scaffold': FormScaffoldSpec
      }
    );

    var make = function (spec) {
      var detail = SpecSchema.asStructOrDie('Form', schema, spec, [

      ]);

      var byName = { };

      var fields = Arr.map(detail.uis(), function (ui) {
        var uid = Objects.readOptFrom(ui, 'uid').getOrThunk(function () { return Tagger.generate(''); });
        var uiSpec = detail.members().ui().munge(Merger.deepMerge(
          ui,
          {
            uid: uid
          }
        ));
        var itemInfo = ValueSchema.asStructOrDie('ui.spec item', uiSchema, uiSpec);
        var output = itemInfo.builder()(itemInfo);
        byName[uiSpec.name] = output.uid;
        return output;
      });

      return Merger.deepMerge(spec, {
        dom: detail.dom(),
        uid: detail.uid(),
        uiType: 'container',
        components: fields,
        representing: {
          query: function (form) {
            var r = {};
            Obj.each(byName, function (field, name) {
              r[name] = field.apis().getValue();
            });
            return r;
          },
          set: function (form, value) {
            Obj.each(value, function (v, k) {
              var fieldUid = byName[k];
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
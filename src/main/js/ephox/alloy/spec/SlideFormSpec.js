define(
  'ephox.alloy.spec.SlideFormSpec',

  [
    'ephox.alloy.form.CustomRadioGroupSpec',
    'ephox.alloy.form.FormScaffoldSpec',
    'ephox.alloy.form.RadioGroupSpec',
    'ephox.alloy.form.TextInputSpec',
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.TabbedSpec',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.peanut.Thunk',
    'ephox.perhaps.Option',
    'ephox.scullion.Cell',
    'global!Error'
  ],

  function (CustomRadioGroupSpec, FormScaffoldSpec, RadioGroupSpec, TextInputSpec, Tagger, SpecSchema, TabbedSpec, UiSubstitutes, FieldPresence, FieldSchema, Objects, ValueSchema, Arr, Obj, Merger, Fun, Thunk, Option, Cell, Error) {
    var schema = [
      FieldSchema.strict('dom'),

      FieldSchema.strict('fieldOrder'),
      FieldSchema.strict('fields'),

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
        'custom-radio-group': CustomRadioGroupSpec,
        'form-scaffold': FormScaffoldSpec
      }
    );

    var make = function (spec) {

      var detail = SpecSchema.asStructOrDie('slide-form', schema.concat([
        // Store the states for panels that have no been craeted
        FieldSchema.state('fieldState', function () {
          return Cell({ });
        })
      ]), spec, [
        'tabbar',
        'tabview',
        'left',
        'right'
      ].concat(spec.fieldOrder));

      var placeholders = {
        '<alloy.slide-form.left>': UiSubstitutes.single(
          Merger.deepMerge(
            detail.parts().left(),
            detail.parts().left().base,
            {
              uid: detail.partUids().left,
              uiType: 'button'
            }
          )
        ),
        '<alloy.slide-form.right>': UiSubstitutes.single(
          Merger.deepMerge(
            detail.parts().right(),
            detail.parts().right().base,
            {
              uid: detail.partUids().right,
              uiType: 'button'
            }
          )
        )
      };

      var components = UiSubstitutes.substitutePlaces(
        Option.some('slide-form'),
        detail,
        detail.components(),
        placeholders,
        { }
      );

      return Merger.deepMerge(
        spec,
        TabbedSpec.make({
          uid: detail.uid(),
          dom: detail.dom(),
          components: components,
          defaultView: Fun.constant([ { uiType: 'container' } ]),
          tabs: Arr.map(detail.fieldOrder(), function (f) {
            return Objects.readOptFrom(detail.fields(), f).fold(function () {
              throw new Error('Slide form trying to create view for: ' + f + '. Field does not exist');
            }, function (uiSpec) {
              var fullSpec = detail.members().ui().munge(
                Merger.deepMerge(
                  uiSpec,
                  {
                    uid: detail.partUids()[f]
                  }
                )
              );
              var itemInfo = ValueSchema.asStructOrDie('ui.spec item', uiSchema, fullSpec);
              var output = itemInfo.builder()(itemInfo);
              return {
                value: f,
                text: f,
                view: Thunk.cached(function (view, revertToBase) {
                  var built = view.getSystem().build(output);
                  return [ { built: built } ];
                })
              };
            });
          }),
          parts: spec.parts
        }),
        {
          // Dupe with form spec
          representing: {
            query: function (form) {
              var r = {};
              Obj.each(detail.partUids(), function (partUid, name) {
                if (Arr.contains([ 'tabbar', 'tabview' ], name)) return;
                form.getSystem().getByUid(partUid).each(function (field) {
                  var delegate = r[name] = field.delegate().map(function (dlg) {
                    return dlg.get()(field);
                  }).getOr(field);
                  r[name] = delegate.apis().getValue();
                });
              });
              return r;
            },
            set: function (form, value) {
              Obj.each(value, function (v, k) {
                var fieldUid = detail.partUids()[k];
                form.getSystem().getByUid(fieldUid).each(function (field) {
                  var delegate = field.delegate().map(function (dlg) {
                    return dlg.get()(field);
                  }).getOr(field);
                  delegate.apis().setValue(v);
                });
              });
            }
          }
        }
      );
    };

    return {
      make: make
    };
  }
);
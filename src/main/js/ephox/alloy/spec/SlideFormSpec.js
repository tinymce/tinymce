define(
  'ephox.alloy.spec.SlideFormSpec',

  [
    'ephox.alloy.form.CustomRadioGroupSpec',
    'ephox.alloy.form.FormScaffoldSpec',
    'ephox.alloy.form.RadioGroupSpec',
    'ephox.alloy.form.TextInputSpec',
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.TabbedSpec',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option'
  ],

  function (CustomRadioGroupSpec, FormScaffoldSpec, RadioGroupSpec, TextInputSpec, SpecSchema, TabbedSpec, UiSubstitutes, FieldSchema, ValueSchema, Merger, Fun, Option) {
    var schema = [
      FieldSchema.strict('dom'),

      FieldSchema.strict('fieldOrder'),
      FieldSchema.strict('fields')
      
      // FieldSchema.field(
      //   'members',
      //   'members',
      //   FieldPresence.strict(),
      //   ValueSchema.objOf([
      //     FieldSchema.strict('ui')
      //   ])
      // )
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

      var detail = SpecSchema.asStructOrDie('slide-form', schema, spec, [
        'tabbar',
        'tabview'
      ]);

      return TabbedSpec.make({
        uid: detail.uid(),
        dom: detail.dom(),
        components: detail.components(),
        defaultView: Fun.constant([ { uiType: 'container' } ]),
        tabs: [ ],
        parts: spec.parts
      });

      var placeholders = {
        '<alloy.slide-form.container>': UiSubstitutes.multiple(
          [ ]
        ),
        '<alloy.slide-form.footer>': UiSubstitutes.single(
          {
            uiType: 'tabbar'
          }
        )
      };

      var components = UiSubstitutes.substitutePlaces(
        Option.some('slide-form'),
        detail,
        detail.components(),
        placeholders,
        { }
      );

      return Merger.deepMerge(spec, {
        uiType: 'container',
        uid: detail.uid(),
        dom: detail.dom(),
        components: components
      });
    };

    return {
      make: make
    };
  }
);
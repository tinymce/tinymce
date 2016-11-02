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
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'global!Error'
  ],

  function (CustomRadioGroupSpec, FormScaffoldSpec, RadioGroupSpec, TextInputSpec, Tagger, SpecSchema, TabbedSpec, UiSubstitutes, FieldPresence, FieldSchema, Objects, ValueSchema, Arr, Merger, Fun, Option, Error) {
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

      var detail = SpecSchema.asStructOrDie('slide-form', schema, spec, [
        'tabbar',
        'tabview'
      ]);

      return TabbedSpec.make({
        uid: detail.uid(),
        dom: detail.dom(),
        components: detail.components(),
        defaultView: Fun.constant([ { uiType: 'container' } ]),
        tabs: Arr.map(detail.fieldOrder(), function (f) {
          return Objects.readOptFrom(detail.fields(), f).fold(function () {
            throw new Error('Slide form trying to create view for: ' + f + '. Field does not exist');
          }, function (uiSpec) {
            var fullSpec = detail.members().ui().munge(
              Merger.deepMerge(
                uiSpec,
                {
                  uid: Objects.readOptFrom(uiSpec, 'uid').getOr(Tagger.generate(''))
                }
              )
            );
            var itemInfo = ValueSchema.asStructOrDie('ui.spec item', uiSchema, fullSpec);
            var output = itemInfo.builder()(itemInfo);
            return {
              value: f,
              text: f,
              view: function (view, revertToBase) {
                return [ output ];
              }
            };
          });
        }),
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
define(
  'ephox.alloy.demo.forms.DemoFields',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.behaviour.Invalidating',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.behaviour.Tabstopping',
    'ephox.alloy.api.component.ComponentUtil',
    'ephox.alloy.api.component.DomFactory',
    'ephox.alloy.api.events.NativeEvents',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.api.ui.FormChooser',
    'ephox.alloy.api.ui.FormCoupledInputs',
    'ephox.alloy.api.ui.FormField',
    'ephox.alloy.api.ui.HtmlSelect',
    'ephox.alloy.api.ui.Input',
    'ephox.alloy.api.ui.TieredMenu',
    'ephox.alloy.api.ui.Typeahead',
    'ephox.alloy.demo.forms.DemoRenders',
    'ephox.alloy.registry.Tagger',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Future',
    'ephox.katamari.api.Result',
    'ephox.sugar.api.properties.Value',
    'global!setTimeout'
  ],

  function (
    Behaviour, Focusing, Invalidating, Representing, Tabstopping, ComponentUtil, DomFactory, NativeEvents, Container, FormChooser, FormCoupledInputs, FormField,
    HtmlSelect, Input, TieredMenu, Typeahead, DemoRenders, Tagger, Arr, Future, Result, Value, setTimeout
  ) {
    var invalidation = function (validate, invalidUid) {
      return Invalidating.config({
        invalidClass: 'invalid-input',
        notify: {
          getContainer: function (input) {
            return ComponentUtil.getByUid(input, invalidUid).map(ComponentUtil.toElem);
          }
        },
        validator: {
          validate: Invalidating.validation(validate),
          onEvent: NativeEvents.input()
        }
      });
    };

    var rawTextMunger = function (spec) {
      var invalidUid = Tagger.generate('demo-invalid-uid');

      var pLabel = FormField.parts().label({
        dom: { tag: 'label', innerHtml: spec.label }
      });

      var pField = FormField.parts().field({
        factory: Input,
        inputBehaviours: Behaviour.derive([
          invalidation(function (v) {
            return v.indexOf('a') === 0 ? Result.error('Do not start with a!') : Result.value({ });
          }, invalidUid),
          Tabstopping.config({ })
        ])
      });

      return {
        dom: {
          tag: 'div'
        },
        components: [
          pLabel,
          Container.sketch({ uid: invalidUid }),
          pField
        ]
      };
    };

    var textMunger = function (spec) {
      var m = rawTextMunger(spec);
      return FormField.sketch(m);
    };


    var selectMunger = function (spec) {
      var pLabel = FormField.parts().label({
        dom: { tag: 'label', innerHtml: spec.label }
      });

      var pField = FormField.parts().field({
        factory: HtmlSelect,
        dom: {
          classes: [ 'ephox-select-wrapper' ]
        },
        selectBehaviours: Behaviour.derive([
          Tabstopping.config({ })
        ]),
        options: spec.options
      });

      return FormField.sketch({
        dom: DomFactory.fromHtml('<div style="border: 1px solid blue;"></div>'),
        components: [
          pLabel,
          Container.sketch({
            dom: DomFactory.fromHtml('<div class="wrapper"></div>'),
            components: [
              pField
            ]
          })
        ]
      });
    };

    var chooserMunger = function (spec) {
      var pLegend = FormChooser.parts().legend({
        dom: {
          innerHtml: spec.legend
        }
      });

      var pChoices = FormChooser.parts().choices({ });

      return FormChooser.sketch({
        markers: {
          choiceClass: 'demo-alloy-choice',
          selectedClass: 'demo-alloy-choice-selected'
        },

        dom: {
          tag: 'div'
        },
        components: [
          pLegend,
          pChoices
        ],
        chooserBehaviours: Behaviour.derive([
          Tabstopping.config({ })
        ]),
        choices: Arr.map(spec.choices, DemoRenders.choice)
      });
    };

    var coupledTextMunger = function (spec) {
      var pField1 = FormCoupledInputs.parts().field1(
        rawTextMunger(spec.field1)
      );
      var pField2 = FormCoupledInputs.parts().field2(
        rawTextMunger(spec.field2)
      );

      var pLock = FormCoupledInputs.parts().lock({
        dom: { tag: 'button', innerHtml: 'x' },
        buttonBehaviours: Behaviour.derive([
          Tabstopping.config({ })
        ])
      });

      return FormCoupledInputs.sketch({
        dom: {
          tag: 'div'
        },
        markers: {
          lockClass: 'demo-selected'
        },
        onLockedChange: function (current, other) {
          var cValue = Representing.getValue(current);
          Representing.setValue(other, cValue);
        },

        components: [
          pField1,
          pField2,
          pLock
        ]
      });
    };

    var typeaheadMunger = function (spec) {
      var pLabel = FormField.parts().label({
        dom: {
          tag: 'label',
          innerHtml: spec.label
        }
      });

      var pField = FormField.parts().field({
        factory: Typeahead,
        minChars: 1,

        lazySink: spec.lazySink,

        fetch: function (input) {

          var text = Value.get(input.element());
          var matching = Arr.bind(spec.dataset, function (d) {
            var index = d.indexOf(text.toLowerCase());
            if (index > -1) {
              var html = d.substring(0, index) + '<b>' + d.substring(index, index + text.length) + '</b>' +
                d.substring(index + text.length);
              return [ { type: 'item', data: { value: d, text: d, html: html }, 'item-class': 'class-' + d } ];
            } else {
              return [ ];
            }
          });

          var matches = matching.length > 0 ? matching : [
            { type: 'separator', text: 'No items' }
          ];

          var future = Future.pure(matches);
          return future.map(function (items) {
            var menu = DemoRenders.menu({
              value: 'typeahead-menu-blah',
              items: Arr.map(items, DemoRenders.item)
            });
            return TieredMenu.singleData('blah', menu);
          });
        },
        dom: {

        },
        parts: {
          menu: {
            markers: DemoRenders.tieredMarkers()
          }
        },

        markers: {
          openClass: 'alloy-selected-open'
        },

        typeaheadBehaviours: Behaviour.derive([
          Tabstopping.config({ })
        ])
      });
      
      return FormField.sketch({
        dom: {
          tag: 'div'
        },
        components: [
          pLabel,
          pField
        ]
      });
    };

    return {
      textMunger: textMunger,
      selectMunger: selectMunger,
      chooserMunger: chooserMunger,
      coupledTextMunger: coupledTextMunger,
      typeaheadMunger: typeaheadMunger
    };
  }
);

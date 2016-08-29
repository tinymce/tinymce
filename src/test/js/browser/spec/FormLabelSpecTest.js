asynctest(
  'FormLabelSpecTest',
 
  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.NamedChain',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiFinder',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.test.GuiSetup',
    'ephox.perhaps.Result',
    'ephox.sugar.api.Attr'
  ],
 
  function (ApproxStructure, Assertions, Chain, NamedChain, Step, UiFinder, GuiFactory, GuiSetup, Result, Attr) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build({
        uiType: 'formlabel',
        field: {
          uiType: 'custom',
          dom: {
            tag: 'div'
          }
        },
        label: 'label-text'
      });

    }, function (doc, body, gui, component, store) {
      var testStructure = Step.sync(function () {
        Assertions.assertStructure(
          'Checking initial structure of form label',
          ApproxStructure.build(function (s, str, arr) {
            return s.element('div', {
              children: [
                s.element('label', {
                  attrs: {
                    'for': str.startsWith('form-field')
                  },
                  html: str.is('label-text')
                }),
                s.element('div', {
                  attrs: {
                    id: str.startsWith('form-field')
                  }
                })
              ]
            });
          }),
          component.element()
        );
      });

      var testCorresponds = Chain.asStep({}, [
        NamedChain.asChain([
          NamedChain.writeValue('container', component.element()),
          NamedChain.direct('container', UiFinder.cFindIn('label'), 'label'),
          NamedChain.direct('container', UiFinder.cFindIn('div[id]'), 'field'),
          NamedChain.bundle(function (input) {
            var forValue = Attr.get(input.label, 'for');
            var idValue = Attr.get(input.field, 'id');
            Assertions.assertEq(
              'Checking the for value of the label matches the id of the field',
              forValue,
              idValue
            );
            return Result.value({ });
          })
        ])
      ]);

      return [
        testStructure,
        testCorresponds
      ];

    }, success, failure);
 

  }
);
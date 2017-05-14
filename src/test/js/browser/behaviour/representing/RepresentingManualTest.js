asynctest(
  'RepresentingTest (mode: manual)',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.test.behaviour.RepresentPipes',
    'ephox.alloy.test.GuiSetup',
    'ephox.sugar.api.properties.Html'
  ],

  function (Behaviour, Representing, GuiFactory, RepresentPipes, GuiSetup, Html) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build({
        dom: {
          tag: 'span',
          innerHtml: 'stuff'
        },
        behaviours: Behaviour.derive([
          Representing.config({
            store: {
              mode: 'manual',
              getValue: function (comp) {
                store.adder('getValue')();
                return Html.get(comp.element());
              },
              setValue: function (comp, v) {
                Html.set(comp.element(), v);
                store.adder('setValue(' + v + ')')();
              },
              initialValue: 'init-value'
            }
          })
        ])
      });

    }, function (doc, body, gui, component, store) {
      return [
        store.sAssertEq('Should have called setValue on init', [ 'setValue(init-value)' ]),
        RepresentPipes.sAssertValue('Checking initial value', 'init-value', component),
        store.sAssertEq('Should have called setValue on init', [ 'setValue(init-value)', 'getValue' ]),
        RepresentPipes.sSetValue(component, 'new-value'),
        store.sAssertEq('Should have called setValue on init', [ 'setValue(init-value)', 'getValue', 'setValue(new-value)' ]),
        RepresentPipes.sAssertValue('Checking 2nd value', 'new-value', component)
      ];
    }, function () { success(); }, failure);

  }
);
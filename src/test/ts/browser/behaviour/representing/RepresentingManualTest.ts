import Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import Representing from 'ephox/alloy/api/behaviour/Representing';
import GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import RepresentPipes from 'ephox/alloy/test/behaviour/RepresentPipes';
import GuiSetup from 'ephox/alloy/test/GuiSetup';
import { Html } from '@ephox/sugar';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('RepresentingTest (mode: manual)', function() {
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
});


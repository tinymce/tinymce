import { ApproxStructure } from '@ephox/agar';
import { Assertions } from '@ephox/agar';
import { Step } from '@ephox/agar';
import Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import Composing from 'ephox/alloy/api/behaviour/Composing';
import GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import Memento from 'ephox/alloy/api/component/Memento';
import GuiSetup from 'ephox/alloy/test/GuiSetup';
import { Option } from '@ephox/katamari';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('Browser Test: behaviour.ComposingTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  var inner = Memento.record({
    dom: { tag: 'span', innerHtml: 'inner' }
  });

  GuiSetup.setup(
    function (store, doc, body) {
      return GuiFactory.build({
        dom: {
          tag: 'div'
        },
        components: [
          inner.asSpec()
        ],
        behaviours: Behaviour.derive([
          Composing.config({
            find: function (comp) {
              return inner.getOpt(comp);
            }
          })
        ])
      });
    },
    function (doc, body, gui, component, store) {
      return [
        Assertions.sAssertStructure(
          'Checking initial structure',
          ApproxStructure.build(function (s, str, arr) {
            return s.element('div', {
              children: [
                s.element('span', {
                  html: str.is('inner')
                })
              ]
            });
          }),
          component.element()
        ),
        Step.sync(function () {
          var delegate = Composing.getCurrent(component).getOrDie('Could not find delegate');
          Assertions.assertStructure(
            'Checking delegate structure',
            ApproxStructure.build(function (s, str, arr) {
              return s.element('span', { html: str.is('inner') });
            }),
            delegate.element()
          );
        })
      ];
    },
    success,
    failure
  );
});


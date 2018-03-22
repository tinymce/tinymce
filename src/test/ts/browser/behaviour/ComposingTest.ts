import { ApproxStructure, Assertions, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Composing } from 'ephox/alloy/api/behaviour/Composing';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as Memento from 'ephox/alloy/api/component/Memento';
import GuiSetup from 'ephox/alloy/test/GuiSetup';

UnitTest.asynctest('Browser Test: behaviour.ComposingTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  const inner = Memento.record({
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
            find (comp) {
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
          const delegate = Composing.getCurrent(component).getOrDie('Could not find delegate');
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

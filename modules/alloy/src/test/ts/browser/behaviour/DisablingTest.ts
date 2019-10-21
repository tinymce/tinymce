import { ApproxStructure, Assertions, Chain, GeneralSteps, Logger, Mouse, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Focus } from '@ephox/sugar';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Disabling } from 'ephox/alloy/api/behaviour/Disabling';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as Memento from 'ephox/alloy/api/component/Memento';
import * as AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import { Button } from 'ephox/alloy/api/ui/Button';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';

UnitTest.asynctest('DisablingTest', (success, failure) => {

  const subject = Memento.record(
    Button.sketch({
      dom: {
        tag: 'button',
        innerHtml: 'button'
      },
      buttonBehaviours: Behaviour.derive([
        Disabling.config({
          disabled: true
        })
      ])
    })
  );

  GuiSetup.setup((store, doc, body) => {
    return GuiFactory.build(
      Container.sketch({
        components: [
          subject.asSpec()
        ],
        events: AlloyEvents.derive([
          AlloyEvents.runOnExecute(store.adder('execute.reached'))
        ])
      }
    ));
  }, (doc, body, gui, component, store) => {

    const sClickButton = Chain.asStep({ }, [
      Chain.mapper(() => {
        return subject.get(component).element();
      }),
      Mouse.cClick
    ]);

    const button = subject.get(component);
    return [
      Assertions.sAssertStructure(
        'Disabled should have a disabled attribute',
        ApproxStructure.build((s, str, arr) => {
          return s.element('button', {
            attrs: {
              disabled: str.is('disabled')
            }
          });
        }),
        button.element()
      ),

      Logger.t(
        'Clicking on disabled button field should not fire event',
        GeneralSteps.sequence([
          Step.sync(() => {
            // TODO: Maybe replace with an alloy focus call
            Focus.focus(button.element());
          }),
          sClickButton,
          store.sAssertEq('Execute did not get past disabled button', [ ])
        ])
      ),

      Logger.t(
        'Re-enable button',
        Step.sync(() => {
          Disabling.enable(button);
        })
      ),

      Assertions.sAssertStructure(
        'After re-enabling, the disabled attribute should be removed',
        ApproxStructure.build((s, str, arr) => {
          return s.element('button', {
            attrs: {
              disabled: str.none()
            }
          });
        }),
        button.element()
      ),

      Logger.t(
        'Clicking on enabled button field *should* fire event',
        GeneralSteps.sequence([
          Step.sync(() => {
            // TODO: Maybe replace with an alloy focus call
            Focus.focus(button.element());
          }),
          sClickButton,
          store.sAssertEq('Execute did not get past disabled button', [ 'execute.reached' ])
        ])
      ),

      Logger.t(
        'Set button to disabled state',
        Step.sync(() => {
          Disabling.set(button, true);
        })
      ),

      Assertions.sAssertStructure(
        'Disabled should have a disabled attribute',
        ApproxStructure.build((s, str, arr) => {
          return s.element('button', {
            attrs: {
              disabled: str.is('disabled')
            }
          });
        }),
        button.element()
      ),

      Logger.t(
        'Set button to enabled state',
        Step.sync(() => {
          Disabling.set(button, false);
        })
      ),

      Assertions.sAssertStructure(
        'After re-enabling, the disabled attribute should be removed',
        ApproxStructure.build((s, str, arr) => {
          return s.element('button', {
            attrs: {
              disabled: str.none()
            }
          });
        }),
        button.element()
      )
    ];
  }, () => { success(); }, failure);
});

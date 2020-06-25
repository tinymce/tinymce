import { ApproxStructure, Assertions, Chain, GeneralSteps, Logger, Mouse, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Focus } from '@ephox/sugar';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Disabling } from 'ephox/alloy/api/behaviour/Disabling';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as Memento from 'ephox/alloy/api/component/Memento';
import * as AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Button } from 'ephox/alloy/api/ui/Button';
import { Container } from 'ephox/alloy/api/ui/Container';

UnitTest.asynctest('DisablingTest', (success, failure) => {

  const memDisabledButton = Memento.record(
    Button.sketch({
      dom: {
        tag: 'button',
        innerHtml: 'button'
      },
      buttonBehaviours: Behaviour.derive([
        Disabling.config({
          disabled: () => true
        })
      ])
    })
  );

  const memEnabledButton = Memento.record(
    Button.sketch({
      dom: {
        tag: 'button',
        innerHtml: 'button'
      },
      buttonBehaviours: Behaviour.derive([
        Disabling.config({
          disabled: () => false,
          disableClass: 'btn-disabled'
        })
      ])
    })
  );

  GuiSetup.setup((store, _doc, _body) => GuiFactory.build(
    Container.sketch({
      components: [
        memDisabledButton.asSpec(),
        memEnabledButton.asSpec()
      ],
      events: AlloyEvents.derive([
        AlloyEvents.runOnExecute(store.adder('execute.reached'))
      ])
    }
    )), (_doc, _body, _gui, component, store) => {

    const sClickButton = Chain.asStep({ }, [
      Chain.mapper(() => memDisabledButton.get(component).element()),
      Mouse.cClick
    ]);

    const disabledButton = memDisabledButton.get(component);
    const enabledButton = memEnabledButton.get(component);
    return [
      Assertions.sAssertStructure(
        'Disabled should have a disabled attribute',
        ApproxStructure.build((s, str, _arr) => s.element('button', {
          attrs: {
            disabled: str.is('disabled')
          }
        })),
        disabledButton.element()
      ),
      Assertions.sAssertStructure(
        'Enabled should not  have a disabled attribute or class',
        ApproxStructure.build((s, str, arr) => s.element('button', {
          attrs: {
            disabled: str.none()
          },
          classes: [ arr.not('btn-disabled') ]
        })),
        enabledButton.element()
      ),

      Logger.t(
        'Clicking on disabled button field should not fire event',
        GeneralSteps.sequence([
          Step.sync(() => {
            // TODO: Maybe replace with an alloy focus call
            Focus.focus(disabledButton.element());
          }),
          sClickButton,
          store.sAssertEq('Execute did not get past disabled button', [ ])
        ])
      ),

      Logger.t(
        'Re-enable button',
        Step.sync(() => {
          Disabling.enable(disabledButton);
        })
      ),

      Assertions.sAssertStructure(
        'After re-enabling, the disabled attribute should be removed',
        ApproxStructure.build((s, str, _arr) => s.element('button', {
          attrs: {
            disabled: str.none()
          }
        })),
        disabledButton.element()
      ),

      Logger.t(
        'Clicking on enabled button field *should* fire event',
        GeneralSteps.sequence([
          Step.sync(() => {
            // TODO: Maybe replace with an alloy focus call
            Focus.focus(disabledButton.element());
          }),
          sClickButton,
          store.sAssertEq('Execute did not get past disabled button', [ 'execute.reached' ])
        ])
      ),

      Logger.t(
        'Set button to disabled state',
        Step.sync(() => {
          Disabling.set(disabledButton, true);
        })
      ),

      Assertions.sAssertStructure(
        'Disabled should have a disabled attribute',
        ApproxStructure.build((s, str, _arr) => s.element('button', {
          attrs: {
            disabled: str.is('disabled')
          }
        })),
        disabledButton.element()
      ),

      Logger.t(
        'Set button to enabled state',
        Step.sync(() => {
          Disabling.set(disabledButton, false);
        })
      ),

      Assertions.sAssertStructure(
        'After re-enabling, the disabled attribute should be removed',
        ApproxStructure.build((s, str, _arr) => s.element('button', {
          attrs: {
            disabled: str.none()
          }
        })),
        disabledButton.element()
      )
    ];
  }, () => { success(); }, failure);
});

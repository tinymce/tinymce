import { ApproxStructure } from '@ephox/agar';
import { Assertions } from '@ephox/agar';
import { Chain } from '@ephox/agar';
import { GeneralSteps } from '@ephox/agar';
import { Logger } from '@ephox/agar';
import { Mouse } from '@ephox/agar';
import { Step } from '@ephox/agar';
import Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import Disabling from 'ephox/alloy/api/behaviour/Disabling';
import GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import Memento from 'ephox/alloy/api/component/Memento';
import AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import Button from 'ephox/alloy/api/ui/Button';
import Container from 'ephox/alloy/api/ui/Container';
import GuiSetup from 'ephox/alloy/test/GuiSetup';
import { Focus } from '@ephox/sugar';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('DisablingTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  var subject = Memento.record(
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


  GuiSetup.setup(function (store, doc, body) {
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
  }, function (doc, body, gui, component, store) {

    var sClickButton = Chain.asStep({ }, [
      Chain.mapper(function () {
        return subject.get(component).element();
      }),
      Mouse.cClick
    ]);

    var button = subject.get(component);
    return [
      Assertions.sAssertStructure(
        'Disabled should have a disabled attribute',
        ApproxStructure.build(function (s, str, arr) {
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
          Step.sync(function () {
            // TODO: Maybe replace with an alloy focus call
            Focus.focus(button.element());
          }),
          sClickButton,
          store.sAssertEq('Execute did not get past disabled button', [ ])
        ])
      ),


      Logger.t(
        'Re-enable button',
        Step.sync(function () {
          Disabling.enable(button);
        })
      ),

      Assertions.sAssertStructure(
        'After re-enabling, the disabled attribute should be removed',
        ApproxStructure.build(function (s, str, arr) {
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
          Step.sync(function () {
            // TODO: Maybe replace with an alloy focus call
            Focus.focus(button.element());
          }),
          sClickButton,
          store.sAssertEq('Execute did not get past disabled button', [ 'execute.reached' ])
        ])
      )

    ];
  }, function () { success(); }, failure);
});


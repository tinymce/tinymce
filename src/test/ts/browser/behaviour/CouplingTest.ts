import { Assertions } from '@ephox/agar';
import { Logger } from '@ephox/agar';
import { Step } from '@ephox/agar';
import GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import Coupling from 'ephox/alloy/api/behaviour/Coupling';
import Button from 'ephox/alloy/api/ui/Button';
import Container from 'ephox/alloy/api/ui/Container';
import Tagger from 'ephox/alloy/registry/Tagger';
import GuiSetup from 'ephox/alloy/test/GuiSetup';
import StepUtils from 'ephox/alloy/test/StepUtils';
import { Attr } from '@ephox/sugar';
import { Node } from '@ephox/sugar';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('CouplingTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  GuiSetup.setup(function (store, doc, body) {
    return GuiFactory.build(
      Container.sketch({
        uid: 'primary',
        containerBehaviours: Behaviour.derive([
          Coupling.config({
            others: {
              'secondary-1': function (primary) {
                return Button.sketch({
                  dom: {
                    tag: 'button'
                  },
                  action: store.adder('clicked on coupled button of: ' + Attr.get(primary.element(), Tagger.attribute()))
                });
              }
            }
          })
        ])
      })
    );
  }, function (doc, body, gui, component, store) {
    return [
      StepUtils.sAssertFailContains(
        'Testing getCoupled with invalid name: fake',
        'No information found for coupled component: fake',
        function () {
          Coupling.getCoupled(component, 'fake');
        }
      ),

      Logger.t(
        'Testing getCoupled with valid name: secondary-1',
        Step.sync(function () {
          var secondary1 = Coupling.getCoupled(component, 'secondary-1');
          var button1 = secondary1.element();
          Assertions.assertEq('secondary1 should be a button', 'button', Node.name(button1));
          Attr.set(button1, 'data-test', 'marked');

          Assertions.assertEq(
            'secondary1 is not recreated. Should still have attribute: data-test',
            'marked',
            Attr.get(Coupling.getCoupled(component, 'secondary-1').element(), 'data-test')
          );
        })
      ),

      store.sAssertEq('Should be nothing on the store', [ ]),
      Step.sync(function () {
        var secondary1 = Coupling.getCoupled(component, 'secondary-1');
        gui.add(secondary1);
        secondary1.element().dom().click();
      }),
      store.sAssertEq(
        'After clicking, store should have message',
        [ 'clicked on coupled button of: primary' ]
      )
    ];
  }, function () { success(); }, failure);
});

